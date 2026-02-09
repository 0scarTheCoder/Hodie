# Hodie Labs - DigitalOcean Infrastructure Cost Analysis

## Executive Summary

Complete cost breakdown using DigitalOcean as primary cloud provider for:
- Database hosting (MongoDB)
- Object storage (health files, genetic data)
- Backend API hosting (Node.js)
- CDN and bandwidth
- Backups and redundancy

---

## DigitalOcean Service Pricing (2026)

### 1. Managed MongoDB Database

| Tier | Specs | Storage | Price | Users Supported |
|------|-------|---------|-------|-----------------|
| **Development** | 1GB RAM, 1 vCPU | 15GB | $15/month | Up to 100 |
| **Basic** | 2GB RAM, 1 vCPU | 25GB | $40/month | Up to 1,000 |
| **Standard** | 4GB RAM, 2 vCPU | 80GB | $120/month | Up to 5,000 |
| **Professional** | 8GB RAM, 4 vCPU | 200GB | $290/month | Up to 20,000 |
| **Enterprise** | 16GB RAM, 8 vCPU | 500GB | $580/month | Up to 50,000 |

**Additional Storage:** $1.00/GB/month beyond included amount

### 2. Droplets (Backend API Hosting)

| Plan | Specs | Bandwidth | Price | Use Case |
|------|-------|-----------|-------|----------|
| **Basic** | 1GB RAM, 1 vCPU, 25GB SSD | 1TB | $6/month | Development |
| **Standard** | 2GB RAM, 1 vCPU, 50GB SSD | 2TB | $12/month | Light production (< 1,000 users) |
| **Premium** | 4GB RAM, 2 vCPU, 80GB SSD | 4TB | $24/month | Production (1,000-10,000 users) |
| **High Performance** | 8GB RAM, 4 vCPU, 160GB SSD | 5TB | $48/month | Scale (10,000-50,000 users) |
| **Enterprise** | 16GB RAM, 8 vCPU, 320GB SSD | 6TB | $96/month | High scale (50,000+ users) |

### 3. Spaces (Object Storage for Files)

**Base:** $5/month includes:
- 250GB storage
- 1TB outbound bandwidth

**Overage:**
- Storage: $0.02/GB/month (beyond 250GB)
- Bandwidth: $0.01/GB (beyond 1TB)

### 4. Block Storage (Additional Database Storage)

**Price:** $0.10/GB/month
- Used for database backups
- Additional file storage if Spaces exceeds limits
- Expandable in 1GB increments

### 5. Load Balancers (Production/Scale)

**Price:** $12/month per load balancer
- Required for high availability
- Distributes traffic across multiple droplets
- Health checks and SSL termination

### 6. CDN (Content Delivery Network)

**Free tier:** 1TB bandwidth/month
**Paid:** $0.01/GB beyond 1TB

---

## Storage Requirements Per User

### Free Tier User
```
User profile: 5KB
Health metrics (basic): 50KB
Session data: 10KB
Chat history (10 messages): 20KB
Total: 85KB ≈ 0.1MB per user
```

### Basic Tier User
```
User profile: 5KB
Health metrics: 200KB
Uploaded files (3/month avg 5MB each): 15MB
Chat history (100 messages): 200KB
Processed data: 500KB
Total: ≈ 16MB per user
```

### Pro Tier User
```
User profile: 5KB
Health metrics + wearables: 2MB
Uploaded files (10/month avg 8MB each): 80MB
Chat history (500 messages): 1MB
Processed data + summaries: 2MB
Weekly reports: 5MB
Total: ≈ 90MB per user
```

### Premium Tier User
```
User profile: 10KB
Health metrics + wearables: 5MB
Uploaded files (30/month avg 10MB each): 300MB
Genetic data (raw + processed): 150MB
Chat history (1000 messages): 2MB
Processed data + AI summaries: 10MB
Medical reports: 50MB
Total: ≈ 517MB per user ≈ 0.5GB
```

---

## Infrastructure Cost Breakdown by Scale

### Scenario 1: Launch (0-1,000 Users)

**User Distribution:**
- 700 free users
- 200 basic users
- 80 pro users
- 20 premium users

#### Storage Requirements
```
Free: 700 × 0.1MB = 70MB
Basic: 200 × 16MB = 3.2GB
Pro: 80 × 90MB = 7.2GB
Premium: 20 × 500MB = 10GB
Total: 20.47GB
```

#### DigitalOcean Costs

| Service | Specification | Monthly Cost |
|---------|--------------|--------------|
| **Managed MongoDB** | Basic (2GB RAM, 25GB storage) | $40.00 |
| **Backend API Droplet** | Standard (2GB RAM, 2 vCPU) | $12.00 |
| **Spaces Storage** | 21GB (within free 250GB tier) | $5.00 |
| **CDN Bandwidth** | ~100GB (within 1TB free) | $0.00 |
| **Backups** | 10GB block storage | $1.00 |
| **SSL Certificates** | Let's Encrypt (free) | $0.00 |
| **Monitoring** | Basic (included) | $0.00 |
| **TOTAL** | | **$58.00/month** |

**Per User Infrastructure Cost:**
- Total cost: $58.00/month
- Total users: 1,000
- **Cost per user: $0.058/month**

**Cost by Tier:**
```
Free tier: $0.058 × 0.7 = $0.041/user
Basic tier: $0.058 × 1.2 = $0.070/user (higher data usage)
Pro tier: $0.058 × 2.0 = $0.116/user
Premium tier: $0.058 × 5.0 = $0.290/user
```

---

### Scenario 2: Growth (10,000 Users)

**User Distribution:**
- 7,000 free users
- 2,000 basic users
- 800 pro users
- 200 premium users

#### Storage Requirements
```
Free: 7,000 × 0.1MB = 700MB
Basic: 2,000 × 16MB = 32GB
Pro: 800 × 90MB = 72GB
Premium: 200 × 500MB = 100GB
Total: 204.7GB
```

#### DigitalOcean Costs

| Service | Specification | Monthly Cost |
|---------|--------------|--------------|
| **Managed MongoDB** | Standard (4GB RAM, 80GB storage) | $120.00 |
| **MongoDB Extra Storage** | 125GB × $1.00 | $125.00 |
| **Backend API Droplet** | Premium (4GB RAM, 2 vCPU) | $24.00 |
| **Spaces Storage** | 205GB (within 250GB included) | $5.00 |
| **CDN Bandwidth** | ~1.2TB ($0.01/GB × 200GB overage) | $2.00 |
| **Backups** | 100GB block storage | $10.00 |
| **Load Balancer** | Basic (high availability) | $12.00 |
| **TOTAL** | | **$298.00/month** |

**Per User Infrastructure Cost:**
- Total cost: $298.00/month
- Total users: 10,000
- **Cost per user: $0.030/month**

**Cost by Tier:**
```
Free tier: $0.030 × 0.5 = $0.015/user
Basic tier: $0.030 × 1.2 = $0.036/user
Pro tier: $0.030 × 2.5 = $0.075/user
Premium tier: $0.030 × 8.0 = $0.240/user
```

---

### Scenario 3: Scale (50,000 Users)

**User Distribution:**
- 35,000 free users
- 10,000 basic users
- 4,000 pro users
- 1,000 premium users

#### Storage Requirements
```
Free: 35,000 × 0.1MB = 3.5GB
Basic: 10,000 × 16MB = 160GB
Pro: 4,000 × 90MB = 360GB
Premium: 1,000 × 500MB = 500GB
Total: 1,023.5GB ≈ 1TB
```

#### DigitalOcean Costs

| Service | Specification | Monthly Cost |
|---------|--------------|--------------|
| **Managed MongoDB Primary** | Professional (8GB RAM, 200GB) | $290.00 |
| **MongoDB Replica (Redundancy)** | Professional (8GB RAM, 200GB) | $290.00 |
| **MongoDB Extra Storage** | 623GB × $1.00 | $623.00 |
| **Backend API Droplets (2x)** | High Performance × 2 | $96.00 |
| **Spaces Storage** | 1024GB ($5 + 774GB × $0.02) | $20.48 |
| **CDN Bandwidth** | ~5TB ($0.01/GB × 4TB overage) | $40.00 |
| **Backups** | 500GB block storage | $50.00 |
| **Load Balancer** | Standard (multi-region) | $12.00 |
| **TOTAL** | | **$1,421.48/month** |

**Per User Infrastructure Cost:**
- Total cost: $1,421.48/month
- Total users: 50,000
- **Cost per user: $0.028/month**

**Cost by Tier:**
```
Free tier: $0.028 × 0.4 = $0.011/user
Basic tier: $0.028 × 1.2 = $0.034/user
Pro tier: $0.028 × 3.0 = $0.084/user
Premium tier: $0.028 × 10.0 = $0.280/user
```

---

### Scenario 4: Enterprise (100,000 Users)

**User Distribution:**
- 70,000 free users
- 20,000 basic users
- 8,000 pro users
- 2,000 premium users

#### Storage Requirements
```
Free: 70,000 × 0.1MB = 7GB
Basic: 20,000 × 16MB = 320GB
Pro: 8,000 × 90MB = 720GB
Premium: 2,000 × 500MB = 1,000GB
Total: 2,047GB ≈ 2TB
```

#### DigitalOcean Costs

| Service | Specification | Monthly Cost |
|---------|--------------|--------------|
| **Managed MongoDB Primary** | Enterprise (16GB RAM, 500GB) | $580.00 |
| **MongoDB Replicas (2x)** | Enterprise × 2 (redundancy) | $1,160.00 |
| **MongoDB Extra Storage** | 1,547GB × $1.00 | $1,547.00 |
| **Backend API Droplets (4x)** | High Performance × 4 | $192.00 |
| **Spaces Storage** | 2,047GB ($5 + 1,797GB × $0.02) | $40.94 |
| **CDN Bandwidth** | ~10TB ($0.01/GB × 9TB overage) | $90.00 |
| **Backups** | 1TB block storage | $100.00 |
| **Load Balancer** | Enterprise (multi-region + DDoS) | $24.00 |
| **Monitoring & Alerts** | Premium monitoring | $20.00 |
| **TOTAL** | | **$3,753.94/month** |

**Per User Infrastructure Cost:**
- Total cost: $3,753.94/month
- Total users: 100,000
- **Cost per user: $0.038/month**

**Cost by Tier:**
```
Free tier: $0.038 × 0.3 = $0.011/user
Basic tier: $0.038 × 1.2 = $0.046/user
Pro tier: $0.038 × 3.5 = $0.133/user
Premium tier: $0.038 × 12.0 = $0.456/user
```

---

## Updated Total Cost Per User (Including DigitalOcean)

### 1,000 Users Scenario

| Tier | AI Cost | DigitalOcean | Payment Processing | Support | **TOTAL COST** | Revenue | **Profit** |
|------|---------|--------------|-------------------|---------|----------------|---------|------------|
| Free | $0.00 | $0.041 | $0.00 | $0.00 | **$0.041** | $0.00 | **-$0.041** |
| Basic | $0.11 | $0.070 | $0.59 | $0.50 | **$1.27** | $9.99 | **$8.72** |
| Pro | $1.03 | $0.116 | $1.02 | $1.50 | **$3.67** | $24.99 | **$21.32** |
| Premium | $25.88 | $0.290 | $1.75 | $8.33 | **$36.28** | $49.99 | **$13.71** |

**Margin Improvement:** Free tier loss reduced from $0.08 to $0.041 (49% improvement)

---

### 10,000 Users Scenario

| Tier | AI Cost | DigitalOcean | Payment Processing | Support | **TOTAL COST** | Revenue | **Profit** |
|------|---------|--------------|-------------------|---------|----------------|---------|------------|
| Free | $0.00 | $0.015 | $0.00 | $0.00 | **$0.015** | $0.00 | **-$0.015** |
| Basic | $0.11 | $0.036 | $0.59 | $0.50 | **$1.24** | $9.99 | **$8.75** |
| Pro | $1.03 | $0.075 | $1.02 | $1.50 | **$3.63** | $24.99 | **$21.36** |
| Premium | $25.88 | $0.240 | $1.75 | $8.33 | **$36.23** | $49.99 | **$13.76** |

**Monthly Breakdown (10,000 users):**
```
Free: 7,000 × $0.015 = $105 loss
Basic: 2,000 × $8.75 = $17,500 profit
Pro: 800 × $21.36 = $17,088 profit
Premium: 200 × $13.76 = $2,752 profit

TOTAL PROFIT: $37,235/month ($446,820/year)
Infrastructure cost: $298/month
```

---

### 100,000 Users Scenario

| Tier | AI Cost | DigitalOcean | Payment Processing | Support | **TOTAL COST** | Revenue | **Profit** |
|------|---------|--------------|-------------------|---------|----------------|---------|------------|
| Free | $0.00 | $0.011 | $0.00 | $0.00 | **$0.011** | $0.00 | **-$0.011** |
| Basic | $0.11 | $0.046 | $0.59 | $0.50 | **$1.25** | $9.99 | **$8.74** |
| Pro | $1.03 | $0.133 | $1.02 | $1.50 | **$3.68** | $24.99 | **$21.31** |
| Premium | $25.88 | $0.456 | $1.75 | $8.33 | **$36.42** | $49.99 | **$13.57** |

**Monthly Breakdown (100,000 users):**
```
Free: 70,000 × $0.011 = $770 loss
Basic: 20,000 × $8.74 = $174,800 profit
Pro: 8,000 × $21.31 = $170,480 profit
Premium: 2,000 × $13.57 = $27,140 profit

TOTAL PROFIT: $371,650/month ($4,459,800/year)
Infrastructure cost: $3,754/month
```

---

## Cost Comparison: MongoDB Atlas vs DigitalOcean

### Current Setup (MongoDB Atlas)

| Users | Atlas Tier | Monthly Cost | Notes |
|-------|-----------|--------------|-------|
| 1,000 | M10 (Shared) | $57/month | Similar to DO Basic |
| 10,000 | M20 (Dedicated) | $188/month | More expensive than DO |
| 50,000 | M40 (High Perf) | $547/month | Much more expensive |
| 100,000 | M60 (Enterprise) | $1,839/month | 51% cheaper than DO equivalent |

**Verdict:**
- DigitalOcean is competitive for small-medium scale (1K-50K users)
- MongoDB Atlas becomes cost-effective at 100K+ users due to optimizations
- **Recommendation:** Start with DigitalOcean, migrate to Atlas if you exceed 100K users

---

## Recommended DigitalOcean Setup by Stage

### Stage 1: Launch (0-1,000 users) - $58/month
```
✓ Managed MongoDB Basic ($40)
✓ Droplet Standard ($12)
✓ Spaces Basic ($5)
✓ Backups ($1)
```

### Stage 2: Growth (1,000-10,000 users) - $298/month
```
✓ Managed MongoDB Standard + extra storage ($245)
✓ Droplet Premium ($24)
✓ Spaces Basic ($5)
✓ Load Balancer ($12)
✓ Backups ($10)
✓ CDN overage ($2)
```

### Stage 3: Scale (10,000-50,000 users) - $1,421/month
```
✓ MongoDB Professional + replica + storage ($1,203)
✓ Droplets High Perf × 2 ($96)
✓ Spaces with overage ($20)
✓ Load Balancer ($12)
✓ Backups ($50)
✓ CDN overage ($40)
```

### Stage 4: Enterprise (50,000-100,000 users) - $3,754/month
```
✓ MongoDB Enterprise cluster + storage ($3,287)
✓ Droplets × 4 ($192)
✓ Spaces with overage ($41)
✓ Load Balancers ($24)
✓ Backups ($100)
✓ CDN overage ($90)
✓ Monitoring ($20)
```

---

## Updated 3-Year Financial Projection

### Year 1: 10,000 Users

**Monthly:**
- Revenue: $49,970
- AI Costs: $18,172
- DigitalOcean: $298
- Other costs: $0
- **Profit: $31,500/month (63% margin)**

**Annual:**
- Revenue: $599,640
- Total Costs: $221,640
- **Profit: $378,000 (63% margin)**

### Year 2: 50,000 Users

**Monthly:**
- Revenue: $249,850
- AI Costs: $90,860
- DigitalOcean: $1,421
- Other costs: $0
- **Profit: $157,569/month (63% margin)**

**Annual:**
- Revenue: $2,998,200
- Total Costs: $1,107,372
- **Profit: $1,890,828 (63% margin)**

### Year 3: 100,000 Users

**Monthly:**
- Revenue: $499,700
- AI Costs: $181,720
- DigitalOcean: $3,754
- Other costs: $0
- **Profit: $314,226/month (63% margin)**

**Annual:**
- Revenue: $5,996,400
- Total Costs: $2,225,688
- **Profit: $3,770,712 (63% margin)**

**3-Year Total Profit: $6,039,540**

---

## Key Insights

1. **Infrastructure scales efficiently**: Per-user cost decreases from $0.058 to $0.028 as you grow
2. **Free tier is sustainable**: Loss reduced to $0.011-0.041 per user (vs $0.23 with exposed Claude API)
3. **Storage is cheap**: Even with 2TB of user data at 100K users, storage is only $41/month
4. **Margins remain strong**: 63% profit margin maintained across all scales
5. **DigitalOcean is cost-effective**: Cheaper than AWS/Azure for this use case

## Recommendations

1. **Start with DigitalOcean** for simplicity and cost savings (0-50K users)
2. **Use Spaces for file storage** instead of storing in MongoDB
3. **Implement data lifecycle policies**:
   - Archive old chat history after 6 months
   - Compress genetic data files
   - Delete inactive free user data after 12 months
4. **Monitor storage growth** and upgrade MongoDB tier proactively
5. **Consider MongoDB Atlas** at 100K+ users for better optimization

---

## Next Steps

1. ✅ Backend API built (uses DigitalOcean-compatible architecture)
2. 🔲 Deploy to DigitalOcean Droplet
3. 🔲 Set up Managed MongoDB cluster
4. 🔲 Configure Spaces for file uploads
5. 🔲 Implement monitoring and alerts
6. 🔲 Set up automated backups

**Total Startup Cost:** $58/month (handles up to 1,000 users)
**Break-even:** ~500 users (250 paid subscribers)

---

*Document prepared for Hodie Labs Pty Ltd - Confidential*
*Cost estimates based on DigitalOcean pricing as of February 2026*
