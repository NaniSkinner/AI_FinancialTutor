# Vercel Deployment Guide - SpendSense Operator Dashboard

## Prerequisites

- Vercel account (free tier works)
- Bun installed locally (for testing build)
- Git repository connected to Vercel

## Phase 1: Initial Deployment (Mock Data Mode)

### Step 1: Prepare the Build

The project is already configured with:

- ✅ `vercel.json` with bun commands
- ✅ `next.config.ts` production settings
- ✅ Environment variable documentation

### Step 2: Test Build Locally

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard
bun run build
```

Expected output: Build completes successfully with no errors.

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel
# or with bun
bun install -g vercel

# Navigate to operator-dashboard
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted:

1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account/team
3. **Link to existing project?** → No (first time)
4. **Project name?** → `spendsense-operator-dashboard` or your choice
5. **Directory?** → `./` (current directory)
6. **Override settings?** → No (uses vercel.json)

#### Option B: Using Vercel Dashboard (Web UI)

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select: `/Users/nanis/dev/Gauntlet/SpendSense` repo
4. Set Root Directory: `ui/operator-dashboard`
5. Framework Preset: Next.js
6. Build Command: `bun run build`
7. Install Command: `bun install`
8. Environment Variables (add these):
   - `NEXT_PUBLIC_USE_MOCK_DATA` = `true`
   - `NEXT_PUBLIC_API_URL` = `https://placeholder.com`
   - `NEXT_PUBLIC_OPERATOR_ID` = `op_001`
9. Click "Deploy"

### Step 4: Verify Deployment

Once deployed, you'll get a URL like: `https://spendsense-operator-dashboard.vercel.app`

Test the following:

- [ ] Dashboard loads without errors
- [ ] Login page works (mock auth)
- [ ] Can view recommendations (mock data)
- [ ] All tabs accessible (Review Queue, User Explorer, Analytics)
- [ ] Actions work (approve/reject/flag with mock data)
- [ ] Settings page loads
- [ ] Onboarding modal appears for new users
- [ ] Mobile responsive design works

### Step 5: Set Custom Domain (Optional)

In Vercel dashboard:

1. Go to your project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning (~5-10 minutes)

## Phase 2: Backend Integration (After API Deployment)

### Update Environment Variables

In Vercel dashboard (Settings > Environment Variables):

1. Update existing variables:
   - `NEXT_PUBLIC_USE_MOCK_DATA` → `false`
   - `NEXT_PUBLIC_API_URL` → `https://your-api.awsapprunner.com`

2. Redeploy:
   ```bash
   vercel --prod
   ```
   Or use the dashboard: Deployments > ⋯ > Redeploy

## Phase 3: Firebase Integration

### Add Firebase Variables

In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=spendsense-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=spendsense-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=spendsense-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Redeploy

```bash
vercel --prod
```

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Pushes to `main` or `master` branch
- **Preview**: Pull requests and other branches

To disable auto-deploy:

1. Project Settings > Git
2. Configure branch settings

## Monitoring & Logs

### View Deployment Logs

```bash
vercel logs [deployment-url]
```

Or in dashboard:

1. Go to Deployments
2. Click on a deployment
3. View build logs and runtime logs

### Analytics

Vercel provides:

- Web Vitals (performance metrics)
- Page views and visits
- Real User Monitoring (RUM)

Access in: Project > Analytics

## Troubleshooting

### Build Fails

1. **Check environment variables**: Ensure all `NEXT_PUBLIC_*` vars are set
2. **Check build logs**: Look for specific error messages
3. **Test locally**: Run `bun run build` to reproduce
4. **Check bun.lockb**: Ensure dependencies are locked

### Runtime Errors

1. **Check browser console**: Look for client-side errors
2. **Check Vercel logs**: Runtime errors appear here
3. **Verify API URL**: Ensure backend is accessible
4. **CORS issues**: Backend must allow Vercel domain

### Environment Variables Not Working

1. **Redeploy after changes**: Env vars only apply to new deployments
2. **Check variable names**: Must start with `NEXT_PUBLIC_` for client access
3. **Clear build cache**: Settings > General > Clear Build Cache

## Rollback

If deployment has issues:

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote [deployment-url]
```

Or in dashboard:

1. Deployments > Click on working deployment
2. Click "Promote to Production"

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use environment-specific vars**: Different values for preview/production
3. **Enable Vercel Authentication**: Settings > Deployment Protection
4. **Review security headers**: Already configured in vercel.json
5. **Monitor for vulnerabilities**: Run `bun audit`

## Performance Optimization

Already configured:

- ✅ Static page generation where possible
- ✅ Image optimization enabled
- ✅ Compression enabled
- ✅ CDN distribution (Vercel Edge Network)

Additional optimizations:

- Consider ISR (Incremental Static Regeneration) for data pages
- Use `next/image` for all images
- Implement dynamic imports for large components

## Cost Estimates

**Vercel Hobby (Free)**:

- 100GB bandwidth/month
- Unlimited deployments
- 100 build executions/day
- Good for: Development, demos, low-traffic apps

**Vercel Pro ($20/month)**:

- 1TB bandwidth/month
- Unlimited deployments
- 6,000 build minutes/month
- Team collaboration
- Password protection
- Good for: Production apps, team projects

## Next Steps

1. ✅ Complete Phase 1 deployment
2. ⏳ Deploy backend API to AWS (Phase 3)
3. ⏳ Set up Firebase (Phase 2)
4. ⏳ Connect frontend to backend (Phase 5)
5. ⏳ Production testing (Phase 5)
6. ⏳ Security hardening (Phase 6)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Bun Docs**: https://bun.sh/docs

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Check project info
vercel inspect

# Pull environment variables
vercel env pull
```
