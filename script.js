document.addEventListener('DOMContentLoaded', () => {
    const state = {
        stack: 'supa',
        userCount: 1000
    };

    // --- Dynamic Pricing Engine (Values per user) ---
    const metrics = {
        dbOpsPerUser: 100, // Monthly operations
        aiTokensPerUser: 5000, // Monthly prompt + completion
        dataTransferGB: 0.1 // per user
    };

    const calculateCosts = (stackId, users) => {
        if (stackId === 'supa') {
            // Fixed Platform Tiers
            let renderPrice = 0;
            if (users > 100) renderPrice = 7; // Starter
            if (users > 5000) renderPrice = 19; // Pro

            let supabasePrice = 0;
            if (users > 500) supabasePrice = 25; // Pro Plan

            // Usage-based (Variable)
            // Gemini API: $0.50 per 1M tokens approx
            const geminiVariable = (users * metrics.aiTokensPerUser / 1000000) * 0.5;
            // Supabase Bandwidth: 50GB included in Pro, then $0.09 per GB
            const totalGB = users * metrics.dataTransferGB;
            const extraBW = Math.max(0, totalGB - (supabasePrice === 25 ? 50 : 5)) * 0.09;

            const fixed = renderPrice + supabasePrice;
            const variable = geminiVariable + extraBW;

            return {
                fixed,
                variable,
                total: fixed + variable,
                breakdown: `Baseline: $${fixed} (SaaS Tiers). Variable usage: $${variable.toFixed(2)} (API Tokens & Bandwidth).`
            };
        } else {
            // Firebase / GCP (Heavily Variable)
            // Firestore: $0.18 per 100k ops. (Assuming Spark free tier limits handled by math)
            const firestoreOps = users * metrics.dbOpsPerUser;
            const firestoreVariable = Math.max(0, (firestoreOps - 50000) / 100000) * 0.18;
            
            // Cloud Run: Based on duration/vCPU/RAM. 
            // Simplified: $0.006 per user (assuming standard small containers with auto-scaling)
            const cloudRunVariable = users <= 100 ? 0 : (users * 0.006);
            
            // Vertex AI: Enterprise-grade Gemini pricing
            const vertexVariable = (users * metrics.aiTokensPerUser / 1000000) * 1.5;

            const fixed = 0; // Pure serverless model
            const variable = firestoreVariable + cloudRunVariable + vertexVariable;

            return {
                fixed,
                variable,
                total: fixed + variable,
                breakdown: `Baseline: $0 (Pure Serverless). Variable usage: $${variable.toFixed(2)} (Compute, DB Ops, AI Tokens).`
            };
        }
    };

    const data = {
        supa: {
            theme: '#3ecf8e',
            arch: {
                backend: 'Express / Node.js API',
                backendLabel: 'Render / Railway Node Service',
                db: 'PostgreSQL (Supabase)',
                dbLabel: 'SQL / Relational / RLS',
                storage: 'Supabase Storage',
                ai: 'Google Gemini Pro API',
                aiLabel: 'SaaS Generative AI'
            },
            classification: [
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: CDN/Builds. Dev: App Code.' },
                { domain: 'Backend API', type: 'PaaS', resp: 'Provider: VM/Runtime. Dev: Node.js/Express.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Scaling/Backups. Dev: Schema/Queries.' },
                { domain: 'AI Integration', type: 'SaaS', resp: 'Provider: LLM Infra. Dev: Prompt Engineering.' }
            ],
            lockin: {
                fin: 'Stable billing via monthly tiers. Predictable but with lower flexibility.',
                proc: 'Low. Standard SQL/Express skills are portable.',
                data: 'Minimal. Postgres exports are universal.'
            }
        },
        fire: {
            theme: '#ffca28',
            arch: {
                backend: 'Cloud Run Service',
                backendLabel: 'GCP Containerized Node.js',
                db: 'Cloud Firestore',
                dbLabel: 'NoSQL / Documents / Real-time',
                storage: 'Firebase Storage',
                ai: 'Vertex AI Gemini Pro',
                aiLabel: 'GCP Unified AI Platform'
            },
            classification: [
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: GCP Edge. Dev: Content.' },
                { domain: 'Backend API', type: 'PaaS (CaaS)', resp: 'Provider: Auto-scaler. Dev: Container Image.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Global State. Dev: Denormalization.' },
                { domain: 'AI Integration', type: 'PaaS', resp: 'Provider: Vertex Model Hub. Dev: API Pipelines.' }
            ],
            lockin: {
                fin: 'Usage spikes (e.g. DDOS or logic loops) directly impact billing.',
                proc: 'High. GCP IAM and Vertex pipelines are specialized ecosystems.',
                data: 'Moderate. Firestore NoSQL to SQL migrations are heavy architecture shifts.'
            }
        }
    };

    // --- DOM Elements ---
    const priceSupa = document.getElementById('price-supa');
    const priceFire = document.getElementById('price-fire');
    const noteSupa = document.getElementById('note-supa').querySelector('.content');
    const noteFire = document.getElementById('note-fire').querySelector('.content');
    
    const barSupaFixed = document.getElementById('bar-supa-fixed');
    const barSupaVar = document.getElementById('bar-supa-var');
    const barFireFixed = document.getElementById('bar-fire-fixed');
    const barFireVar = document.getElementById('bar-fire-var');

    const updateUI = () => {
        const isSupa = state.stack === 'supa';
        const stack = data[state.stack];

        // 1. Calculations
        const sCost = calculateCosts('supa', state.userCount);
        const fCost = calculateCosts('fire', state.userCount);

        // 2. Pricing visualization
        priceSupa.textContent = `$${Math.round(sCost.total)}`;
        priceFire.textContent = `$${Math.round(fCost.total)}`;

        // Normalize bar widths (Max scale approx $200)
        const maxScale = Math.max(sCost.total, fCost.total, 80);
        
        barSupaFixed.style.width = `${(sCost.fixed / maxScale) * 100}%`;
        barSupaVar.style.width = `${(sCost.variable / maxScale) * 100}%`;
        
        barFireFixed.style.width = `${(fCost.fixed / maxScale) * 100}%`;
        barFireVar.style.width = `${(fCost.variable / maxScale) * 100}%`;

        // 3. Notes (English)
        noteSupa.textContent = sCost.breakdown;
        noteFire.textContent = fCost.breakdown;

        // 4. Diagram Update
        document.getElementById('box-backend').textContent = stack.arch.backend;
        document.getElementById('label-backend').textContent = stack.arch.backendLabel;
        document.getElementById('box-database').textContent = stack.arch.db;
        document.getElementById('box-database').nextElementSibling.textContent = stack.arch.dbLabel;
        document.getElementById('box-storage').textContent = stack.arch.storage;
        document.getElementById('box-ai').textContent = stack.arch.ai;
        document.getElementById('box-ai').nextElementSibling.textContent = stack.arch.aiLabel;
        document.getElementById('arch-type-label').textContent = isSupa ? "Current: Fixed/Tiered Core" : "Alternative: Elastic/Usage Core";

        // 5. Analysis (English)
        document.getElementById('lock-fin').textContent = stack.lockin.fin;
        document.getElementById('lock-proc').textContent = stack.lockin.proc;
        document.getElementById('lock-data').textContent = stack.lockin.data;

        // Visual opacity for inactive stack
        document.getElementById('note-supa').style.opacity = isSupa ? "1" : "0.5";
        document.getElementById('note-fire').style.opacity = isSupa ? "0.5" : "1";
        document.getElementById('risk-current').style.opacity = isSupa ? "1" : "0.35";
        document.getElementById('risk-alt').style.opacity = isSupa ? "0.35" : "1";
    };

    // --- Interaction ---
    document.getElementById('btn-supa').addEventListener('click', () => { 
        state.stack = 'supa'; 
        document.getElementById('btn-supa').classList.add('active');
        document.getElementById('btn-fire').classList.remove('active');
        updateUI(); 
    });
    document.getElementById('btn-fire').addEventListener('click', () => { 
        state.stack = 'fire'; 
        document.getElementById('btn-fire').classList.add('active');
        document.getElementById('btn-supa').classList.remove('active');
        updateUI(); 
    });

    document.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.userCount = parseInt(e.target.dataset.val);
            updateUI();
        });
    });

    updateUI();
});
