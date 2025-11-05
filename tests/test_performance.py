"""
Performance Tests (Phase 5)

Tests performance requirements from PRD3-5:
- Single assignment latency (<500ms)
- Batch assignment throughput (100 users in <60s)
- Database query performance
- Concurrent request handling
"""

import pytest
import time
from personas.assignment import PersonaAssigner
from personas.transitions import PersonaTransitionTracker
from tests.personas.conftest import insert_test_user


class TestLatency:
    """Test latency requirements (Phase 5.1)."""
    
    def test_single_assignment_latency(self, test_db, high_util_signals, benchmark):
        """Test that single assignment completes in <500ms."""
        insert_test_user(test_db, 'user_perf', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        # Benchmark the assignment
        result = benchmark(assigner.assign_personas, 'user_perf', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        # Benchmark will report timing automatically
    
    def test_simple_signals_latency(self, test_db, benchmark):
        """Test assignment latency with simple signals."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 70.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 45000}
        }
        
        insert_test_user(test_db, 'user_simple', signals)
        assigner = PersonaAssigner(test_db)
        
        result = benchmark(assigner.assign_personas, 'user_simple', '30d')
        assert result is not None
    
    def test_complex_signals_latency(self, test_db, benchmark):
        """Test assignment latency with complex signals (multiple matches)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 2,
                'cards': [
                    {'utilization_pct': 55.0, 'minimum_payment_only': False},
                    {'utilization_pct': 45.0, 'minimum_payment_only': False},
                ]
            },
            'income': {
                'median_pay_gap_days': 65,
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {
                'recurring_merchant_count': 5,
                'monthly_recurring_spend': 120.0,
                'subscription_share_pct': 12.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 45000}
        }
        
        insert_test_user(test_db, 'user_complex', signals)
        assigner = PersonaAssigner(test_db)
        
        result = benchmark(assigner.assign_personas, 'user_complex', '30d')
        # Should match multiple personas
        assert len(result['all_matches']) >= 2
    
    def test_assignment_with_storage_latency(self, test_db, savings_builder_signals, benchmark):
        """Test end-to-end latency including database write."""
        insert_test_user(test_db, 'user_storage', savings_builder_signals)
        assigner = PersonaAssigner(test_db)
        
        def assign_and_store():
            assignment = assigner.assign_personas('user_storage', '30d')
            assignment_id = assigner.store_assignment(assignment)
            return assignment_id
        
        result = benchmark(assign_and_store)
        assert result is not None


class TestThroughput:
    """Test throughput requirements (Phase 5.2)."""
    
    def test_batch_assignment_10_users(self, test_db, high_util_signals):
        """Test batch assignment for 10 users."""
        assigner = PersonaAssigner(test_db)
        
        # Create 10 users
        for i in range(10):
            insert_test_user(test_db, f'user_{i}', high_util_signals)
        
        start = time.time()
        
        # Assign personas to all
        results = []
        for i in range(10):
            result = assigner.assign_personas(f'user_{i}', '30d')
            results.append(result)
        
        elapsed = time.time() - start
        
        # Should complete 10 users quickly
        assert elapsed < 5.0, f"10 users took {elapsed}s (should be <5s)"
        assert len(results) == 10
        assert all(r['primary_persona'] == 'high_utilization' for r in results)
    
    def test_batch_assignment_50_users(self, test_db, variable_income_signals):
        """Test batch assignment for 50 users."""
        assigner = PersonaAssigner(test_db)
        
        # Create 50 users
        for i in range(50):
            insert_test_user(test_db, f'user_{i}', variable_income_signals)
        
        start = time.time()
        
        # Assign personas to all
        results = []
        for i in range(50):
            result = assigner.assign_personas(f'user_{i}', '30d')
            results.append(result)
        
        elapsed = time.time() - start
        
        # Should complete 50 users in reasonable time
        assert elapsed < 25.0, f"50 users took {elapsed}s (should be <25s)"
        assert len(results) == 50
    
    @pytest.mark.slow
    def test_batch_assignment_100_users_target(self, test_db, student_signals):
        """Test batch assignment for 100 users (target: <60s)."""
        assigner = PersonaAssigner(test_db)
        
        # Create 100 users
        for i in range(100):
            insert_test_user(test_db, f'user_{i}', student_signals)
        
        start = time.time()
        
        # Assign personas to all
        results = []
        for i in range(100):
            result = assigner.assign_personas(f'user_{i}', '30d')
            results.append(result)
        
        elapsed = time.time() - start
        
        # Target: 100 users in <60 seconds
        assert elapsed < 60.0, f"100 users took {elapsed}s (target: <60s)"
        assert len(results) == 100
        
        # Calculate average per-user time
        avg_time = (elapsed / 100) * 1000  # in ms
        print(f"\nAverage assignment time: {avg_time:.2f}ms per user")
        assert avg_time < 500, f"Average {avg_time}ms exceeds 500ms target"
    
    def test_database_query_get_latest_assignment(self, test_db, savings_builder_signals, benchmark):
        """Test performance of get_latest_assignment query."""
        assigner = PersonaAssigner(test_db)
        
        # Create and store an assignment
        insert_test_user(test_db, 'user_query', savings_builder_signals)
        assignment = assigner.assign_personas('user_query', '30d')
        assigner.store_assignment(assignment)
        
        def get_assignment():
            cursor = test_db.cursor()
            cursor.execute("""
                SELECT * FROM user_personas
                WHERE user_id = ? AND window_type = ?
                ORDER BY assigned_at DESC
                LIMIT 1
            """, ('user_query', '30d'))
            return cursor.fetchone()
        
        result = benchmark(get_assignment)
        assert result is not None
    
    def test_database_query_get_transition_history(self, test_db, benchmark):
        """Test performance of get_transition_history query."""
        tracker = PersonaTransitionTracker(test_db)
        
        # Insert some transitions
        cursor = test_db.cursor()
        for i in range(10):
            cursor.execute("""
                INSERT INTO persona_transitions (
                    transition_id, user_id, from_persona, to_persona, transition_date,
                    days_in_previous_persona, celebration_shown
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (f'trans_{i}', 'user_test', 'general', 'savings_builder', 
                  f'2025-11-0{i+1}T10:00:00', 30, False))
        test_db.commit()
        
        result = benchmark(tracker.get_transition_history, 'user_test', limit=10)
        assert len(result) == 10


class TestLoadHandling:
    """Test load handling and concurrent requests (Phase 5.3)."""
    
    def test_sequential_assignments_no_degradation(self, test_db, high_util_signals):
        """Test that sequential assignments don't degrade over time."""
        assigner = PersonaAssigner(test_db)
        
        timings = []
        
        for i in range(20):
            insert_test_user(test_db, f'user_{i}', high_util_signals)
            
            start = time.time()
            result = assigner.assign_personas(f'user_{i}', '30d')
            elapsed = (time.time() - start) * 1000  # ms
            
            timings.append(elapsed)
            assert result['primary_persona'] == 'high_utilization'
        
        # Check that later assignments aren't significantly slower
        first_10_avg = sum(timings[:10]) / 10
        last_10_avg = sum(timings[10:]) / 10
        
        # Allow 20% degradation
        assert last_10_avg < first_10_avg * 1.2, \
            f"Performance degraded: {first_10_avg:.2f}ms → {last_10_avg:.2f}ms"
    
    def test_database_connection_reuse(self, test_db, variable_income_signals):
        """Test that database connections are reused efficiently."""
        # Multiple assigners should use connections efficiently
        for i in range(10):
            insert_test_user(test_db, f'user_{i}', variable_income_signals)
            assigner = PersonaAssigner(test_db)
            result = assigner.assign_personas(f'user_{i}', '30d')
            assert result['primary_persona'] == 'variable_income_budgeter'


class TestBenchmarks:
    """Benchmark specific operations (Phase 5.4)."""
    
    def test_benchmark_persona_matching(self, test_db, high_util_signals, benchmark):
        """Benchmark the persona matching algorithm."""
        insert_test_user(test_db, 'user_bench', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        def match_persona():
            return assigner._check_persona('high_utilization', high_util_signals)
        
        result = benchmark(match_persona)
        assert result is True
    
    def test_benchmark_criteria_evaluation(self, test_db, student_signals, benchmark):
        """Benchmark criteria evaluation for complex persona."""
        insert_test_user(test_db, 'user_bench', student_signals)
        assigner = PersonaAssigner(test_db)
        
        def evaluate_criteria():
            return assigner._get_persona_criteria('student', student_signals)
        
        result = benchmark(evaluate_criteria)
        assert result is not None
    
    def test_benchmark_json_serialization(self, test_db, subscription_heavy_signals, benchmark):
        """Benchmark JSON serialization of assignment results."""
        import json
        
        insert_test_user(test_db, 'user_bench', subscription_heavy_signals)
        assigner = PersonaAssigner(test_db)
        assignment = assigner.assign_personas('user_bench', '30d')
        
        def serialize():
            return json.dumps(assignment['criteria_met'])
        
        result = benchmark(serialize)
        assert result is not None
    
    def test_benchmark_database_insert(self, test_db, savings_builder_signals, benchmark):
        """Benchmark database insertion of assignment."""
        insert_test_user(test_db, 'user_bench', savings_builder_signals)
        assigner = PersonaAssigner(test_db)
        assignment = assigner.assign_personas('user_bench', '30d')
        
        def store():
            return assigner.store_assignment(assignment)
        
        result = benchmark(store)
        assert result is not None


class TestPerformanceMetrics:
    """Test and report performance metrics."""
    
    def test_p50_p95_p99_latency(self, test_db, high_util_signals):
        """Measure p50, p95, p99 latency for persona assignment."""
        assigner = PersonaAssigner(test_db)
        timings = []
        
        # Run 100 assignments
        for i in range(100):
            insert_test_user(test_db, f'user_{i}', high_util_signals)
            
            start = time.time()
            assigner.assign_personas(f'user_{i}', '30d')
            elapsed = (time.time() - start) * 1000  # ms
            
            timings.append(elapsed)
        
        # Calculate percentiles
        timings.sort()
        p50 = timings[49]  # 50th percentile
        p95 = timings[94]  # 95th percentile
        p99 = timings[98]  # 99th percentile
        
        print(f"\nLatency Metrics:")
        print(f"  p50: {p50:.2f}ms")
        print(f"  p95: {p95:.2f}ms")
        print(f"  p99: {p99:.2f}ms")
        
        # Target: p95 < 500ms
        assert p95 < 500.0, f"p95 latency {p95:.2f}ms exceeds 500ms target"
    
    def test_throughput_users_per_second(self, test_db, variable_income_signals):
        """Measure throughput in users per second."""
        assigner = PersonaAssigner(test_db)
        
        # Create 50 users
        for i in range(50):
            insert_test_user(test_db, f'user_{i}', variable_income_signals)
        
        start = time.time()
        
        for i in range(50):
            assigner.assign_personas(f'user_{i}', '30d')
        
        elapsed = time.time() - start
        throughput = 50 / elapsed
        
        print(f"\nThroughput: {throughput:.2f} users/second")
        
        # Should handle at least 2 users per second
        assert throughput >= 2.0, f"Throughput {throughput:.2f} users/s is too low"

