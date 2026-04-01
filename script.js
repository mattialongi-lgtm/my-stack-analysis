document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        stack: 'supa',
        userCount: 1000
    };

    // --- Dynamic Pricing Engine ---
    const metrics = {
        dbOpsPerUser: 100, 
        aiTokensPerUser: 5000, 
        dataTransferGB: 0.1 
    };

    const data = {
        supa: {
            theme: '#3ecf8e',
            arch: {
                backend: 'Express / Node.js API',
                backendLabel: 'Render / Railway Tiers',
                db: 'PostgreSQL (Supabase)',
                dbLabel: 'Relational / RLS Enabled',
                storage: 'Supabase Storage',
                ai: 'Google Gemini Pro API',
                aiLabel: 'SaaS Generative AI'
            },
            classification: [
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: CDN/Builds. Dev: App Code.' },
                { domain: 'Backend API', type: 'PaaS', resp: 'Provider: VM/Runtime. Dev: Node.js/Express.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Postgres Infra. Dev: Schema.' },
                { domain: 'AI Integration', type: 'SaaS', resp: 'Provider: LLM. Dev: Prompt Eng.' }
            ],
            lockin: {
                fin: 'Stable billing via monthly tiers.',
                proc: 'Low. Standard SQL/Express skills are portable.',
                data: 'Minimal. Postgres exports are universal.'
            }
        },
        fire: {
            theme: '#ffca28',
            arch: {
                backend: 'Cloud Run Service',
                backendLabel: 'GCP Container Service',
                db: 'Cloud Firestore',
                dbLabel: 'NoSQL / Scale Managed',
                storage: 'Firebase Storage',
                ai: 'Vertex AI Gemini Pro',
                aiLabel: 'GCP AI Platform'
            },
            classification: [
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: Firebase Edge. Dev: Content.' },
                { domain: 'Backend API', type: 'CaaS', resp: 'Provider: GCR Scaling. Dev: Docker Image.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Global State. Dev: Denormalization.' },
                { domain: 'AI Integration', type: 'PaaS', resp: 'Provider: Vertex AI. Dev: Pipelines.' }
            ],
            lockin: {
                fin: 'Usage spikes impact billing immediately.',
                proc: 'High. GCP IAM and Vertex are specialized.',
                data: 'Moderate. NoSQL to SQL migrations are heavy.'
            }
        }
    };

    const calculateCosts = (stackId, users) => {
        try {
            if (stackId === 'supa') {
                let renderPrice = users > 5000 ? 19 : 7;
                let supabasePrice = users > 500 ? 25 : 0;
                const geminiVar = (users * metrics.aiTokensPerUser / 1000000) * 0.5;
                const totalGB = users * metrics.dataTransferGB;
                const extraBW = Math.max(0, totalGB - (supabasePrice === 25 ? 50 : 5)) * 0.09;
                
                const fixed = renderPrice + supabasePrice;
                const variable = geminiVar + extraBW;
                return { fixed, variable, total: fixed + variable };
            } else {
                const firestoreVar = Math.max(0, (users * metrics.dbOpsPerUser - 50000) / 100000) * 0.18;
                const cloudRunVar = users <= 100 ? 0 : (users * 0.006);
                const vertexVar = (users * metrics.aiTokensPerUser / 1000000) * 1.5;
                return { fixed: 0, variable: firestoreVar + cloudRunVar + vertexVar, total: firestoreVar + cloudRunVar + vertexVar };
            }
        } catch (e) { return { fixed: 0, variable: 0, total: 0 }; }
    };

    const updateUI = () => {
        const stack = data[state.stack];
        const isS = state.stack === 'supa';

        // 1. Classification Cards (Force First)
        try {
            const grid = document.getElementById('class-grid');
            if(grid) {
                grid.innerHTML = stack.classification.map(item => `
                    <div class="class-item">
                        <div class="class-header">
                            <strong>${item.domain}</strong>
                            <span class="badge">${item.type}</span>
                        </div>
                        <div class="class-resp">${item.resp}</div>
                    </div>
                `).join('');
            }
        } catch(e) { console.error(e); }

        // 2. Costs
        try {
            const sC = calculateCosts('supa', state.userCount);
            const fC = calculateCosts('fire', state.userCount);
            const maxS = Math.max(sC.total, fC.total, 80);

            document.getElementById('price-supa').textContent = `$${Math.round(sC.total)}`;
            document.getElementById('price-fire').textContent = `$${Math.round(fC.total)}`;
            
            document.getElementById('bar-supa-fixed').style.width = `${(sC.fixed / maxS) * 100}%`;
            document.getElementById('bar-supa-var').style.width = `${(sC.variable / maxS) * 100}%`;
            document.getElementById('bar-fire-fixed').style.width = `${(fC.fixed / maxS) * 100}%`;
            document.getElementById('bar-fire-var').style.width = `${(fC.variable / maxS) * 100}%`;

            document.getElementById('note-supa').querySelector('.content').textContent = `Fixed Platform: $${sC.fixed}. Variable Usage: $${sC.variable.toFixed(1)}.`;
            document.getElementById('note-fire').querySelector('.content').textContent = `Fixed Platform: $0. Variable Usage: $${fC.variable.toFixed(1)}.`;
        } catch(e) { console.error(e); }

        // 3. Diagram (By specific ID)
        try {
            document.getElementById('box-backend').textContent = stack.arch.backend;
            document.getElementById('label-backend').textContent = stack.arch.backendLabel;
            document.getElementById('box-database').textContent = stack.arch.db;
            document.getElementById('label-database').textContent = stack.arch.dbLabel;
            document.getElementById('box-storage').textContent = stack.arch.storage;
            document.getElementById('box-ai').textContent = stack.arch.ai;
            document.getElementById('label-ai').textContent = stack.arch.aiLabel;
            document.getElementById('arch-type-label').textContent = isS ? "Current: Modular Ecosystem" : "Alternative: Elastic Ecosystem";
        } catch(e) { console.error(e); }

        // 4. Analysis
        try {
            document.getElementById('lock-fin').textContent = stack.lockin.fin;
            document.getElementById('lock-proc').textContent = stack.lockin.proc;
            document.getElementById('lock-data').textContent = stack.lockin.data;
        } catch(e) { console.error(e); }

        // 5. Risks & Opacity
        try {
            const isSupa = isS;
            document.getElementById('note-supa').style.opacity = isSupa ? "1" : "0.5";
            document.getElementById('note-fire').style.opacity = isSupa ? "0.5" : "1";
            document.getElementById('risk-current').style.opacity = isSupa ? "1" : "0.35";
            document.getElementById('risk-alt').style.opacity = isSupa ? "0.35" : "1";
        } catch(e) { console.error(e); }
    };

    // --- Events ---
    document.getElementById('btn-supa').addEventListener('click', () => { state.stack = 'supa'; updateUI(); document.getElementById('btn-supa').classList.add('active'); document.getElementById('btn-fire').classList.remove('active'); });
    document.getElementById('btn-fire').addEventListener('click', () => { state.stack = 'fire'; updateUI(); document.getElementById('btn-fire').classList.add('active'); document.getElementById('btn-supa').classList.remove('active'); });

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
