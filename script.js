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
        try {
            if (stackId === 'supa') {
                let renderPrice = 0;
                if (users > 100) renderPrice = 7; 
                if (users > 5000) renderPrice = 19; 

                let supabasePrice = 0;
                if (users > 500) supabasePrice = 25; 

                const geminiVariable = (users * metrics.aiTokensPerUser / 1000000) * 0.5;
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
                const firestoreOps = users * metrics.dbOpsPerUser;
                const firestoreVariable = Math.max(0, (firestoreOps - 50000) / 100000) * 0.18;
                const cloudRunVariable = users <= 100 ? 0 : (users * 0.006);
                const vertexVariable = (users * metrics.aiTokensPerUser / 1000000) * 1.5;

                const fixed = 0;
                const variable = firestoreVariable + cloudRunVariable + vertexVariable;

                return {
                    fixed,
                    variable,
                    total: fixed + variable,
                    breakdown: `Baseline: $0 (Pure Serverless). Variable usage: $${variable.toFixed(2)} (Compute, DB Ops, AI Tokens).`
                };
            }
        } catch (e) {
            console.error("Calculation Error", e);
            return { fixed: 0, variable: 0, total: 0, breakdown: "Error calculating costs." };
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

    const updateUI = () => {
        try {
            const isSupa = state.stack === 'supa';
            const stack = data[state.stack];

            // 1. Calculations
            const sCost = calculateCosts('supa', state.userCount);
            const fCost = calculateCosts('fire', state.userCount);

            // 2. Pricing visualization
            const pSupa = document.getElementById('price-supa');
            const pFire = document.getElementById('price-fire');
            if(pSupa) pSupa.textContent = `$${Math.round(sCost.total)}`;
            if(pFire) pFire.textContent = `$${Math.round(fCost.total)}`;

            // Bars
            const bSF = document.getElementById('bar-supa-fixed');
            const bSV = document.getElementById('bar-supa-var');
            const bFF = document.getElementById('bar-fire-fixed');
            const bFV = document.getElementById('bar-fire-var');
            const maxScale = Math.max(sCost.total, fCost.total, 80);
            
            if(bSF) bSF.style.width = `${(sCost.fixed / maxScale) * 100}%`;
            if(bSV) bSV.style.width = `${(sCost.variable / maxScale) * 100}%`;
            if(bFF) bFF.style.width = `${(fCost.fixed / maxScale) * 100}%`;
            if(bFV) bFV.style.width = `${(fCost.variable / maxScale) * 100}%`;

            // 3. Notes
            const nS = document.getElementById('note-supa');
            const nF = document.getElementById('note-fire');
            if(nS) nS.querySelector('.content').textContent = sCost.breakdown;
            if(nF) nF.querySelector('.content').textContent = fCost.breakdown;

            // 4. Diagram Update
            const boxBE = document.getElementById('box-backend');
            const boxDB = document.getElementById('box-database');
            const boxST = document.getElementById('box-storage');
            const boxAI = document.getElementById('box-ai');
            
            if(boxBE) {
                boxBE.textContent = stack.arch.backend;
                document.getElementById('label-backend').textContent = stack.arch.backendLabel;
            }
            if(boxDB) {
                boxDB.textContent = stack.arch.db;
                boxDB.nextElementSibling.textContent = stack.arch.dbLabel;
            }
            if(boxST) boxST.textContent = stack.arch.storage;
            if(boxAI) {
                boxAI.textContent = stack.arch.ai;
                boxAI.nextElementSibling.textContent = stack.arch.aiLabel;
            }
            document.getElementById('arch-type-label').textContent = isSupa ? "Current: Fixed/Tiered Core" : "Alternative: Elastic/Usage Core";

            // 5. Classification Cards (THE FIX)
            const classGrid = document.getElementById('class-grid');
            if(classGrid) {
                classGrid.innerHTML = stack.classification.map(item => `
                    <div class="class-item">
                        <div class="class-header">
                            <strong>${item.domain}</strong>
                            <span class="badge">${item.type}</span>
                        </div>
                        <div class="class-resp">${item.resp}</div>
                    </div>
                `).join('');
            }

            // 6. Analysis
            document.getElementById('lock-fin').textContent = stack.lockin.fin;
            document.getElementById('lock-proc').textContent = stack.lockin.proc;
            document.getElementById('lock-data').textContent = stack.lockin.data;

            // 7. Opacity
            document.getElementById('note-supa').style.opacity = isSupa ? "1" : "0.5";
            document.getElementById('note-fire').style.opacity = isSupa ? "0.5" : "1";
            document.getElementById('risk-current').style.opacity = isSupa ? "1" : "0.35";
            document.getElementById('risk-alt').style.opacity = isSupa ? "0.35" : "1";

        } catch (e) {
            console.error("Critical UI Error", e);
        }
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
