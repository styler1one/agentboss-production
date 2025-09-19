# 🗄️ SUPABASE DATABASE SETUP GUIDE

## 📋 **STAP-VOOR-STAP SUPABASE CONFIGURATIE**

### **🚀 1. SUPABASE PROJECT AANMAKEN**

#### **1.1 Account Setup:**
1. Ga naar [supabase.com](https://supabase.com)
2. Sign up / Log in met je GitHub account
3. Click "New Project"

#### **1.2 Project Configuration:**
```
Project Name: agentboss-production
Organization: [Your Organization]
Database Password: [Generate Strong Password - SAVE THIS!]
Region: Europe (West) - eu-west-1
Pricing Plan: Pro ($25/month) - Required for production
```

#### **1.3 Project Settings:**
- **Auto-pause:** Disabled (Pro plan)
- **Connection Pooling:** Enabled
- **SSL Mode:** Require
- **Timezone:** Europe/Amsterdam

---

### **🔗 2. DATABASE CONNECTION SETUP**

#### **2.1 Connection Details ophalen:**
1. Ga naar **Settings** → **Database**
2. Kopieer de **Connection String**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

#### **2.2 Environment Variables:**
Maak een `.env.local` file in je project root:
```env
# Database URLs
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

#### **2.3 API Keys ophalen:**
1. Ga naar **Settings** → **API**
2. Kopieer:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep secret!)

---

### **🛠️ 3. PRISMA DATABASE SETUP**

#### **3.1 Database Schema Pushen:**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to Supabase (first time)
npm run db:push
```

#### **3.2 Verify Database:**
```bash
# Open Prisma Studio to view data
npm run db:studio
```

#### **3.3 Check Supabase Dashboard:**
1. Ga naar **Table Editor** in Supabase
2. Verify dat alle tabellen zijn aangemaakt:
   - users
   - client_profiles
   - expert_profiles
   - projects
   - contracts
   - agents
   - etc.

---

### **🔐 4. SECURITY CONFIGURATION**

#### **4.1 Row Level Security (RLS):**
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- Continue for all tables...
```

#### **4.2 Basic RLS Policies:**
```sql
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);
```

#### **4.3 Database Extensions:**
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

### **📊 5. VERCEL ENVIRONMENT VARIABLES**

#### **5.1 Vercel Dashboard Setup:**
1. Ga naar je Vercel project
2. **Settings** → **Environment Variables**
3. Voeg toe:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

#### **5.2 Environment Settings:**
- **Environment:** Production, Preview, Development
- **Apply to all environments** ✅

---

### **🧪 6. DATABASE TESTING**

#### **6.1 Connection Test:**
Maak een test API route: `app/api/db-test/route.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    
    return Response.json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount 
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
```

#### **6.2 Test Endpoints:**
```bash
# Local test
curl http://localhost:3000/api/db-test

# Production test  
curl https://your-app.vercel.app/api/db-test
```

---

### **📈 7. MONITORING & BACKUP**

#### **7.1 Supabase Monitoring:**
- **Dashboard** → **Reports** voor usage metrics
- **Logs** → **Database** voor query performance
- **Auth** → **Users** voor user management

#### **7.2 Automated Backups:**
- **Settings** → **Database** → **Backups**
- **Daily backups** enabled (Pro plan)
- **Point-in-time recovery** available

#### **7.3 Performance Monitoring:**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

### **🚨 8. TROUBLESHOOTING**

#### **8.1 Common Issues:**

**Connection Timeout:**
```
Error: connect ETIMEDOUT
```
**Solution:** Check firewall, verify connection string

**SSL Certificate Error:**
```
Error: self signed certificate
```
**Solution:** Add `?sslmode=require` to connection string

**Permission Denied:**
```
Error: permission denied for table
```
**Solution:** Check RLS policies, verify user permissions

#### **8.2 Debug Commands:**
```bash
# Test Prisma connection
npx prisma db pull

# Reset database (DANGER!)
npx prisma migrate reset

# View generated SQL
npx prisma migrate diff --preview-feature
```

---

### **✅ 9. SETUP VERIFICATION CHECKLIST**

```bash
☐ Supabase project created and configured
☐ Database password saved securely
☐ Connection string working
☐ Environment variables set in Vercel
☐ Prisma schema pushed successfully
☐ All tables created in Supabase
☐ RLS policies configured
☐ Database extensions enabled
☐ API test endpoint working
☐ Monitoring and backups configured
☐ Team access granted (if applicable)
```

---

### **🎯 10. NEXT STEPS AFTER DATABASE SETUP**

1. **✅ Database Ready** - All tables and relationships created
2. **🔐 Authentication** - Implement NextAuth.js with Supabase
3. **👤 User Management** - Registration and profile system
4. **🧪 API Development** - CRUD operations for all entities
5. **🎨 UI Components** - Build forms and dashboards

---

## 🚀 **READY TO PROCEED!**

**Zodra Supabase is geconfigureerd, hebben we een enterprise-ready PostgreSQL database met:**
- **Complete schema** voor alle AgentBoss features
- **Secure connections** met SSL
- **Automated backups** en monitoring
- **Scalable architecture** voor growth
- **GDPR compliant** EU hosting

**Laat me weten zodra Supabase is opgezet, dan gaan we door naar de authentication implementatie!** 🔐✨
