# SpendSense Documentation

Welcome to the SpendSense documentation hub. This directory contains all project documentation organized by topic.

## 📚 Quick Links

### Getting Started
- [Project README](../README.md) - Main project overview
- [Setup & Installation](setup/README.md) - Development environment setup
- [Architecture Overview](Architecture.md) - System architecture and design

### Deployment
- [Deployment Overview](deployment/overview.md) - Production deployment guide
- [Deployment Checklist](deployment/checklist.md) - Pre-deployment verification
- [Vercel Deployment](deployment/vercel.md) - Frontend deployment
- [AWS Deployment](deployment/aws.md) - Backend deployment
- [Firebase Setup](deployment/firebase.md) - Database configuration
- [Security Monitoring](deployment/security-monitoring.md) - Security best practices

### Development
- [Integration Testing](setup/integration-testing.md) - Testing strategies
- [Operations Guide](setup/operations.md) - Day-to-day operations
- [Examples](EXAMPLES.md) - Code examples and patterns

### Product Requirements
- [Main PRD](PRD.md) - Product requirements document
- [Calculator Feature](CalcPRD.md) - Calculator requirements
- [Gamification Feature](GamePRD.md) - Gamification requirements
- [Onboarding Feature](OnBoarPRD.md) - Onboarding requirements

### Task Lists
- [Calculator Tasks](CalcTasks.md)
- [Gamification Tasks](GameTasks.md)
- [Onboarding Tasks](OnBoarTasks.md)
- [Technical Tasks](TecTasks.md)

### Implementation Summaries
- [Onboarding Implementation](ONBOARDING_IMPLEMENTATION_SUMMARY.md)

### Archived
- [Completed Tasks](Completed/) - Historical project tasks

---

## 📁 Directory Structure

```
Docs/
├── README.md                          # This file
├── Architecture.md                    # System architecture
├── PRD.md                             # Main product requirements
├── EXAMPLES.md                        # Code examples
│
├── deployment/                        # Deployment guides
│   ├── overview.md                    # Deployment overview
│   ├── checklist.md                   # Pre-deployment checklist
│   ├── guide.md                       # Detailed deployment guide
│   ├── summary.md                     # Quick deployment summary
│   ├── vercel.md                      # Vercel (frontend)
│   ├── aws.md                         # AWS (backend)
│   ├── firebase.md                    # Firebase (database)
│   └── security-monitoring.md         # Security setup
│
├── setup/                             # Development setup
│   ├── integration-testing.md         # Testing guide
│   └── operations.md                  # Operations manual
│
├── Completed/                         # Historical documentation
│   ├── PRD6-5.md
│   ├── ChatPRD.md
│   ├── ChatTasks.md
│   └── userPRD.md
│
└── [Feature PRDs & Tasks]             # Feature-specific docs
```

---

## 🎯 Documentation By Role

### For Developers
1. [Architecture Overview](Architecture.md)
2. [Setup Guide](setup/README.md)
3. [Examples](EXAMPLES.md)
4. [Integration Testing](setup/integration-testing.md)

### For DevOps/SRE
1. [Deployment Overview](deployment/overview.md)
2. [Deployment Checklist](deployment/checklist.md)
3. [Security Monitoring](deployment/security-monitoring.md)
4. [Operations Guide](setup/operations.md)

### For Product Managers
1. [Main PRD](PRD.md)
2. [Feature PRDs](CalcPRD.md) (Calculator, Gamification, Onboarding)
3. [Task Lists](TecTasks.md)

### For New Team Members
1. Start with: [Project README](../README.md)
2. Then read: [Architecture Overview](Architecture.md)
3. Set up environment: [Setup Guide](setup/README.md)
4. Review: [Examples](EXAMPLES.md)

---

## 🔍 Finding Documentation

### By Component

**Frontend (Next.js)**
- UI Documentation: `/ui/operator-dashboard/README.md`
- Component READMEs: `/ui/operator-dashboard/components/*/README.md`
- Setup: `/ui/operator-dashboard/SETUP.md`
- Environment: `/ui/operator-dashboard/ENV_SETUP.md`

**Backend (FastAPI)**
- API Documentation: `/api/README.md`
- Personas System: `/api/README_PERSONAS.md`
- Environment Variables: `/api/ENV_VARIABLES.md`
- Migration Guide: `/api/MIGRATION_GUIDE.md`

**Personas System**
- Overview: `/personas/README.md`
- Examples: `/personas/examples/`

---

## 📝 Documentation Standards

When creating new documentation:

1. **Location**: Place in appropriate subdirectory
2. **Naming**: Use kebab-case for files (e.g., `my-feature.md`)
3. **Index**: Update this README with links
4. **Format**: Use clear headings, code blocks, and examples
5. **Keep Current**: Update docs when code changes

---

## 🤝 Contributing

When adding features:
1. Create feature documentation in appropriate directory
2. Add entry to this index
3. Update relevant component READMEs
4. Add examples to `EXAMPLES.md` if applicable

---

**Last Updated:** 2025-11-11
