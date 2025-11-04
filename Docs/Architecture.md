graph TB
subgraph "PROJECT ROOT: /spendsense"

        subgraph "DATA SOURCES"
            DS1[Kaggle Datasets<br/>- Credit Card Transactions<br/>- PaySim Mobile Money<br/>- Loan Prediction]
            DS2[Synthetic Generator Output<br/>- synthetic_users.csv<br/>- synthetic_accounts.csv<br/>- synthetic_transactions.csv<br/>- synthetic_liabilities.csv]
        end

        subgraph "INGEST MODULE: /ingest"
            I1["data_generator.py<br/>├─ SyntheticDataGenerator<br/>│  ├─ generate_users(num_users=100)<br/>│  ├─ generate_accounts(user_id)<br/>│  ├─ generate_transactions(account_id, months=6)<br/>│  ├─ generate_liabilities(account_id)<br/>│  └─ export_to_csv(output_dir)"]

            I2["loader.py<br/>├─ DataLoader<br/>│  ├─ load_accounts(csv_path)<br/>│  ├─ load_transactions(csv_path)<br/>│  ├─ load_liabilities(csv_path)<br/>│  └─ _validate_schema(df)"]

            I3["validator.py<br/>├─ SchemaValidator<br/>│  ├─ validate_accounts(df)<br/>│  ├─ validate_transactions(df)<br/>│  └─ validate_liabilities(df)"]
        end

        subgraph "DATABASE: spendsense.db (SQLite)"
            DB1[(users<br/>accounts<br/>transactions<br/>liabilities<br/>user_signals<br/>user_personas<br/>recommendations<br/>user_consent<br/>user_interactions<br/>chat_history<br/>persona_transitions<br/>operator_audit_log)]
        end

        subgraph "FEATURES MODULE: /features"
            F1["subscriptions.py<br/>├─ SubscriptionDetector<br/>│  ├─ detect_recurring_merchants(user_id, window_days=90)<br/>│  │  Returns: recurring merchants, cadence<br/>│  ├─ calculate_subscription_signals(user_id, window_days=30)<br/>│  │  Returns: {recurring_merchant_count, monthly_recurring_spend, subscription_share_pct}<br/>│  └─ _detect_cadence(transactions)"]

            F2["savings.py<br/>├─ SavingsAnalyzer<br/>│  ├─ calculate_savings_signals(user_id, window_days=180)<br/>│  │  Returns: {net_savings_inflow, savings_growth_rate_pct, emergency_fund_months}<br/>│  ├─ _get_savings_accounts(user_id)<br/>│  ├─ _calculate_net_inflow(accounts, window)<br/>│  └─ _calculate_monthly_expenses(user_id)"]

            F3["credit.py<br/>├─ CreditAnalyzer<br/>│  ├─ calculate_credit_signals(user_id)<br/>│  │  Returns: {cards[], aggregate_utilization_pct, any_card_high_util, any_interest_charges}<br/>│  ├─ _calculate_utilization(balance, limit)<br/>│  ├─ _detect_minimum_payment_only(liability)<br/>│  └─ _get_interest_charges(account_id, window)"]

            F4["income.py<br/>├─ IncomeAnalyzer<br/>│  ├─ calculate_income_signals(user_id, window_days=180)<br/>│  │  Returns: {income_type, payment_frequency, median_pay_gap_days, cash_flow_buffer_months}<br/>│  ├─ _get_deposits(user_id, window)<br/>│  ├─ _calculate_pay_gaps(deposits)<br/>│  ├─ _classify_income_type(deposits)<br/>│  └─ _get_checking_balance(user_id)"]

            F5["base.py<br/>├─ BaseFeatureDetector<br/>│  ├─ _load_user_data(user_id)<br/>│  ├─ _filter_by_window(transactions, days)<br/>│  └─ _store_signals(user_id, signals)"]
        end

        subgraph "PERSONAS MODULE: /personas"
            P1["assignment.py<br/>├─ PersonaAssigner<br/>│  ├─ assign_personas(user_id, window_type='30d')<br/>│  │  Returns: {primary_persona, secondary_personas, criteria_met}<br/>│  ├─ _check_high_utilization(signals)<br/>│  ├─ _check_variable_income(signals)<br/>│  ├─ _check_student(signals)<br/>│  ├─ _check_subscription_heavy(signals)<br/>│  ├─ _check_savings_builder(signals)<br/>│  └─ _get_match_strength(signals, persona)"]

            P2["transitions.py<br/>├─ PersonaTransitionTracker<br/>│  ├─ detect_transition(user_id)<br/>│  │  Returns: {transition_detected, from_persona, to_persona, celebration_message}<br/>│  ├─ _get_latest_persona(user_id, window)<br/>│  ├─ _get_previous_persona(user_id, window)<br/>│  └─ _create_celebration(from_persona, to_persona)"]

            P3["definitions.py<br/>├─ PERSONA_CRITERIA = {<br/>│  'high_utilization': {...},<br/>│  'variable_income_budgeter': {...},<br/>│  'student': {...},<br/>│  'subscription_heavy': {...},<br/>│  'savings_builder': {...}<br/>}"]
        end

        subgraph "RECOMMEND MODULE: /recommend"
            R1["engine.py<br/>├─ RecommendationEngine<br/>│  ├─ generate_recommendations(user_id, window_type='30d')<br/>│  │  Returns: {recommendations[], partner_offers[], status}<br/>│  ├─ _load_persona(user_id, window)<br/>│  ├─ _load_signals(user_id, window)<br/>│  ├─ _calculate_priority(signals, content)<br/>│  └─ _generate_partner_offers(user_id, persona, signals)"]

            R2["content_matcher.py<br/>├─ ContentMatcher<br/>│  ├─ find_best_content(user_signals, persona, top_k=3)<br/>│  │  Returns: [{id, title, relevance_score}]<br/>│  ├─ _load_catalog(catalog_path)<br/>│  ├─ _embed_catalog()<br/>│  │  Uses: sentence-transformers 'all-MiniLM-L6-v2'<br/>│  ├─ _signals_to_text(signals, persona)<br/>│  └─ _calculate_cosine_similarity(query_emb, content_embs)"]

            R3["llm_rationale.py<br/>├─ RationaleGenerator<br/>│  ├─ generate_rationale(user_data, content_item, persona)<br/>│  │  Returns: personalized rationale string<br/>│  │  Uses: OpenAI GPT-4, temperature=0.7<br/>│  ├─ _load_template(persona, template_type)<br/>│  ├─ _fill_template(template, user_data)<br/>│  └─ _polish_with_llm(filled_template)<br/>│     OpenAI API: chat.completions.create()"]

            R4["partner_offers.py<br/>├─ PartnerOfferGenerator<br/>│  ├─ generate_offers(user_id, persona, signals)<br/>│  │  Returns: [{id, type, title, rationale, eligibility_met}]<br/>│  ├─ _check_eligibility_balance_transfer(signals)<br/>│  ├─ _check_eligibility_hysa(signals)<br/>│  └─ _calculate_savings(signals)"]

            R5["templates.py<br/>├─ RATIONALE_TEMPLATES = {<br/>│  'high_utilization': {...},<br/>│  'student': {...},<br/>│  ...<br/>}"]
        end

        subgraph "GUARDRAILS MODULE: /guardrails"
            G1["consent.py<br/>├─ ConsentManager<br/>│  ├─ request_consent(user_id, consent_type='all')<br/>│  ├─ record_consent(user_id, consent_type, granted, metadata)<br/>│  ├─ check_consent(user_id, action)<br/>│  │  Actions: 'generate_signals', 'generate_recommendations', 'show_partner_offers'<br/>│  └─ revoke_consent(user_id, consent_type)"]

            G2["tone_checker.py<br/>├─ ToneChecker<br/>│  ├─ check_tone(text)<br/>│  │  Returns: {passes, violations, severity}<br/>│  ├─ _check_blocklist(text)<br/>│  │  Blocklist: ['overspending', 'wasteful', 'irresponsible', ...]<br/>│  └─ _llm_tone_check(text)<br/>│     Uses: OpenAI GPT-4 for subtle shaming detection"]

            G3["advice_detector.py<br/>├─ AdviceDetector<br/>│  ├─ detect_advice(text)<br/>│  │  Returns: {is_advice, triggers, recommendation}<br/>│  └─ _check_patterns(text)<br/>│     Patterns: ['you should', 'I recommend', 'you must', ...]"]

            G4["eligibility.py<br/>├─ EligibilityChecker<br/>│  ├─ check_product_eligibility(user_id, product_type)<br/>│  │  Returns: boolean<br/>│  ├─ filter_ineligible_recommendations(user_id, recommendations)<br/>│  └─ _get_user_accounts(user_id)"]

            G5["disclaimers.py<br/>├─ DisclaimerGenerator<br/>│  └─ get_disclaimer(content_type, persona)<br/>│     Returns: disclaimer text"]
        end

        subgraph "API MODULE: /api"
            API1["app.py<br/>├─ FastAPI app<br/>├─ CORS middleware<br/>└─ Routes imported from routes.py"]

            API2["routes.py<br/>├─ POST /users<br/>├─ POST /consent<br/>├─ GET /profile/{user_id}<br/>├─ GET /recommendations/{user_id}<br/>├─ POST /feedback<br/>├─ GET /operator/review<br/>├─ POST /operator/approve<br/>├─ POST /operator/reject<br/>├─ POST /operator/modify<br/>└─ POST /chat"]

            API3["middleware.py<br/>├─ auth_middleware<br/>├─ logging_middleware<br/>└─ error_handler"]
        end

        subgraph "UI MODULE: /ui"
            UI1["operator-dashboard/<br/>├─ OperatorDashboard.jsx<br/>├─ ReviewQueue.jsx<br/>├─ UserExplorer.jsx<br/>├─ DecisionTraces.jsx<br/>└─ operator_actions.py<br/>   ├─ approve_recommendation()<br/>   ├─ reject_recommendation()<br/>   ├─ modify_recommendation()<br/>   └─ flag_for_review()"]

            UI2["user-dashboard/<br/>├─ Dashboard.jsx<br/>├─ HeroInsight.jsx<br/>├─ RecommendationsFeed.jsx<br/>├─ ChatWidget.jsx<br/>└─ chat_handler.py<br/>   └─ handle_question(user_id, question)"]

            UI3["calculators/<br/>├─ EmergencyFundCalculator.jsx<br/>├─ DebtPayoffCalculator.jsx<br/>└─ UtilizationCalculator.jsx"]

            UI4["gamification/<br/>├─ ProgressTracker.jsx<br/>└─ SavingsChallenge.jsx"]

            UI5["email-templates/<br/>├─ weekly-digest.html<br/>└─ monthly-summary.html"]
        end

        subgraph "CONTENT LIBRARY: /content"
            C1["library/<br/>├─ articles/ (Markdown)<br/>│  ├─ credit_utilization_101.md<br/>│  ├─ variable_income_budgeting.md<br/>│  ├─ student_budget_basics.md<br/>│  ├─ subscription_audit_guide.md<br/>│  └─ ... (15-25 total)<br/>├─ calculators/ (React)<br/>├─ infographics/ (PNG/SVG)<br/>└─ videos/ (YouTube links)"]

            C2["content_catalog.json<br/>{<br/>  'articles': [{id, title, file, personas[], difficulty, tags, triggers}],<br/>  'calculators': [...],<br/>  'videos': [...]<br/>}"]
        end

        subgraph "EVAL MODULE: /eval"
            E1["metrics.py<br/>├─ calculate_all_metrics(users)<br/>│  Returns: {coverage, explainability, latency, ...}<br/>└─ generate_report(metrics)"]

            E2["coverage.py<br/>├─ CoverageEvaluator<br/>├─ evaluate_coverage(users)<br/>│  Returns: {coverage_pct, users_with_persona, ...}<br/>└─ _count_detected_behaviors(signals)"]

            E3["explainability.py<br/>├─ ExplainabilityEvaluator<br/>├─ evaluate_explainability(recommendations)<br/>└─ _has_data_citation(text)"]

            E4["latency.py<br/>├─ LatencyEvaluator<br/>└─ evaluate_latency(num_users=50)"]

            E5["fairness.py<br/>├─ FairnessEvaluator<br/>└─ evaluate_fairness(demographic_groups)"]
        end

        subgraph "EXTERNAL SERVICES"
            EXT1["OpenAI API<br/>- GPT-4 for rationale generation<br/>- GPT-4 for chat Q&A<br/>- GPT-4 for tone checking<br/>Model: 'gpt-4'<br/>Temp: 0.7<br/>Max tokens: 150"]

            EXT2["Sentence Transformers<br/>- Model: 'all-MiniLM-L6-v2'<br/>- For semantic search<br/>- Content embedding<br/>- Query embedding"]
        end

        subgraph "CONFIG & DOCS"
            CFG1[".env<br/>OPENAI_API_KEY=...<br/>DATABASE_URL=...<br/>DEBUG=True"]

            CFG2["requirements.txt<br/>fastapi<br/>openai<br/>sentence-transformers<br/>pandas<br/>numpy<br/>sqlalchemy<br/>pydantic<br/>pytest"]

            CFG3["docs/<br/>├─ DECISION_LOG.md<br/>├─ SCHEMA.md<br/>├─ API_SPEC.md<br/>└─ LIMITATIONS.md"]
        end

        subgraph "TESTS: /tests"
            T1["test_features.py<br/>- test_subscription_detector()<br/>- test_credit_utilization()<br/>- test_savings_analyzer()<br/>- test_income_analyzer()"]

            T2["test_personas.py<br/>- test_persona_assignment_high_utilization()<br/>- test_persona_assignment_student()<br/>- test_transition_detection()"]

            T3["test_recommendations.py<br/>- test_rationale_generation()<br/>- test_content_matching()<br/>- test_recommendation_latency()"]

            T4["test_guardrails.py<br/>- test_tone_checker_blocks_shaming()<br/>- test_advice_detector()<br/>- test_consent_requirement()<br/>- test_eligibility_filtering()"]

            T5["test_e2e.py<br/>- test_end_to_end_pipeline()<br/>- test_operator_workflow()"]
        end
    end

    %% DATA FLOW CONNECTIONS
    DS1 --> I1
    DS2 --> I2
    I1 --> I2
    I2 --> I3
    I3 --> DB1

    %% FEATURE PIPELINE
    DB1 --> F1
    DB1 --> F2
    DB1 --> F3
    DB1 --> F4
    F1 --> F5
    F2 --> F5
    F3 --> F5
    F4 --> F5
    F5 --> DB1

    %% PERSONA SYSTEM
    DB1 --> P1
    P1 --> P2
    P1 --> P3
    P2 --> DB1

    %% RECOMMENDATION ENGINE
    DB1 --> R1
    P1 --> R1
    C2 --> R2
    R2 --> EXT2
    R1 --> R2
    R1 --> R3
    R3 --> EXT1
    R5 --> R3
    R1 --> R4

    %% GUARDRAILS
    R1 --> G1
    R3 --> G2
    G2 --> EXT1
    R3 --> G3
    R1 --> G4
    G1 --> DB1

    %% API LAYER
    API2 --> API1
    API3 --> API1
    API1 --> DB1
    API1 --> P1
    API1 --> R1
    API1 --> G1

    %% UI LAYER
    UI1 --> API1
    UI2 --> API1
    UI2 --> EXT1
    UI3 --> API1

    %% EVALUATION
    DB1 --> E1
    E1 --> E2
    E1 --> E3
    E1 --> E4
    E1 --> E5

    %% TESTS
    T1 --> F1
    T1 --> F2
    T1 --> F3
    T1 --> F4
    T2 --> P1
    T2 --> P2
    T3 --> R1
    T3 --> R2
    T3 --> R3
    T4 --> G1
    T4 --> G2
    T4 --> G3
    T4 --> G4
    T5 --> API1

    %% CONFIG
    CFG1 --> API1
    CFG1 --> EXT1

    %% STYLING
    style DB1 fill:#d4e7c5,stroke:#333,stroke-width:3px
    style EXT1 fill:#b4a7d6,stroke:#333,stroke-width:2px
    style EXT2 fill:#a0c4ff,stroke:#333,stroke-width:2px
    style API1 fill:#caffbf,stroke:#333,stroke-width:2px
    style R3 fill:#ffd6a5,stroke:#333,stroke-width:2px
    style G2 fill:#ffadad,stroke:#333,stroke-width:2px
    style G3 fill:#ffadad,stroke:#333,stroke-width:2px
