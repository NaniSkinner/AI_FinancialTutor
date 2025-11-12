# Legacy Test Files

This directory contains historical test files from the development phases of SpendSense.

## Files

- **test_persona_assignment.py** - Original persona assignment tests (replaced by `/tests/personas/test_assignment.py`)
- **test_phase2.py through test_phase9_validation.py** - Phase-based development validation tests

## Purpose

These tests were created during incremental development to validate features as they were built. They are preserved for historical reference but are superseded by the comprehensive test suite in `/tests/`.

## Current Test Suite

For active test development, use:
- `/tests/` - Main test suite
- `/tests/personas/` - Persona system tests
- `/api/tests/` - Backend API tests
- `/ui/operator-dashboard/__tests__/` - Frontend component tests

## Notes

- These files may reference older schemas or APIs that have since been updated
- Some tests may no longer pass due to refactoring
- Retained for documentation purposes only
