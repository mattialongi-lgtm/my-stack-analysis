document.addEventListener('DOMContentLoaded', () => {
    const state = { stack: 'supa', userCount: 1000 };
    const metrics = { dbOpsPerUser: 100, aiTokensPerUser: 5000, dataTransferGB: 0.1 };

    const data = {
        supa: {
            arch: {
                backend: 'Express / Node.js API', backendLabel: 'Render / Railway',
                db: 'PostgreSQL (Supabase)', dbLabel: 'SQL / Relational / RLS',
                storage: 'Supabase Storage', ai: 'Google Gemini Pro API', aiLabel: 'SaaS Generative AI'
            },
            classification: [
                { domain: 'Frontend', type: 'PaaS', resp: 'Provider: CDN. Dev: App Code.' },
                { domain: 'Backend', type: 'PaaS', resp: 'Provider: VM. Dev: API Logic.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Postgres. Dev: Schema.' }
            ],
            migration: [
                { area: 'Core', desc: 'Maintain current architecture.', effort: 'N/A', class: 'low' }
            ],
            lockin: { fin: 'Predictable billing tiers.', proc: 'Low. SQL skills are universal.', data: 'Postgres is standard SQL.' },
            risks: 'Postgres scales well, but intensive custom logic in the Node.js backend can become a bottleneck without horizontal scaling.'
        },
        fire: {
            arch: {
                backend: 'Cloud Run Service', backendLabel: 'GCP Container Service',
                db: 'Cloud Firestore', dbLabel: 'NoSQL / Global Scale',
                storage: 'Firebase Storage', ai: 'Vertex AI Gemini Pro', aiLabel: 'GCP AI Platform'
            },
            classification: [
                { domain: 'Frontend', type: 'PaaS', resp: 'Provider: Edge. Dev: Content.' },
                { domain: 'Backend', type: 'CaaS', resp: 'Provider: GCR. Dev: Containers.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Firestore. Dev: NoSQL.' }
            ],
            migration: [
                { area: 'DB Schema', desc: 'SQL to NoSQL Refactoring.', effort: 'High: 5 Days', class: 'high' },
                { area: 'Compute', desc: 'Containerizing Express service.', effort: 'Mid: 3 Days', class: 'mid' },
                { area: 'AI SDK', desc: 'Vertex AI Client integration.', effort: 'Low: 1 Day', class: 'low' }
            ],
            lockin: { fin: 'Usage spikes impact billing.', proc: 'High. GCP IAM is specialized.', data: 'Firestore NoSQL is proprietary.' },
            risks: 'Google Cloud IAM complexity can lead to deployment failures and security leaks if not managed by DevOps experts.'
        }
    };

    const calculateCosts = (stackId, users) => {
        if (stackId === 'supa') {
            const fixed = (users > 5000 ? 19 : 7) + (users > 500 ? 25 : 0);
            const variable = (users * metrics.aiTokensPerUser / 1000000) * 0.5 + Math.max(0, users * metrics.dataTransferGB - 50) * 0.09;
            return { fixed, variable, total: fixed + variable };
        } else {
            const variable = (users * metrics.dbOpsPerUser / 100000) * 0.18 + (users * 0.006) + (users * metrics.aiTokensPerUser / 1000000) * 1.5;
            return { fixed: 0, variable, total: variable };
        }
    };

    const updateUI = () => {
        const s = data[state.stack];
        const isS = state.stack === 'supa';

        // Helper to safely set text
        const safeText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        // 1. Classification
        const grid = document.getElementById('class-grid');
        if(grid) grid.innerHTML = s.classification.map(i => `
            <div class="class-item">
                <div class="class-header"><strong>${i.domain}</strong><span class="badge">${i.type}</span></div>
                <div class="class-resp">${i.resp}</div>
            </div>`).join('');

        // 2. Migration
        const mGrid = document.getElementById('assess-grid') || document.getElementById('migration-grid');
        if(mGrid) mGrid.innerHTML = s.migration.map(i => `
            <div class="assess-item">
                <div class="assess-header">${i.area} Update</div>
                <div class="assess-desc">${i.desc}</div>
                <div class="effort-tag ${i.class}">${i.effort}</div>
            </div>`).join('');

        // 3. Diagram
        safeText('box-backend', s.arch.backend);
        safeText('label-backend', s.arch.backendLabel);
        safeText('box-database', s.arch.db);
        safeText('label-database', s.arch.dbLabel);
        safeText('box-storage', s.arch.storage);
        safeText('box-ai', s.arch.ai);
        safeText('label-ai', s.arch.aiLabel);
        safeText('label-frontend', isS ? 'Render / Railway' : 'Firebase Hosting');

        // 4. Costs
        const sC = calculateCosts('supa', state.userCount);
        const fC = calculateCosts('fire', state.userCount);
        const maxS = Math.max(sC.total, fC.total, 80);
        
        safeText('price-supa', `$${Math.round(sC.total)}`);
        safeText('price-fire', `$${Math.round(fC.total)}`);

        const bSF = document.getElementById('bar-supa-fixed');
        const bSV = document.getElementById('bar-supa-var');
        const bFV = document.getElementById('bar-fire-var');
        
        if (bSF) bSF.style.width = `${(sC.fixed/maxS)*100}%`;
        if (bSV) bSV.style.width = `${(sC.variable/maxS)*100}%`;
        if (bFV) bFV.style.width = `${(fC.variable/maxS)*100}%`;

        // 5. Notes & Lock-in
        const nS = document.getElementById('note-supa');
        if(nS && nS.querySelector('.content')) nS.querySelector('.content').textContent = `Fixed: $${sC.fixed}, Var: $${sC.variable.toFixed(1)}`;
        
        safeText('lock-fin', s.lockin.fin);
        safeText('lock-proc', s.lockin.proc);
        safeText('lock-data', s.lockin.data);

        // 6. Risks (ENFORCED)
        safeText('risk-p-curr', data.supa.risks);
        safeText('risk-p-alt', data.fire.risks);
        
        const rC = document.getElementById('risk-current');
        const rA = document.getElementById('risk-alt');
        if(rC) rC.style.opacity = isS ? "1" : "0.35";
        if(rA) rA.style.opacity = isS ? "0.35" : "1";
    };

    // --- Interaction ---
    const btnS = document.getElementById('btn-supa');
    const btnF = document.getElementById('btn-fire');
    if(btnS) btnS.addEventListener('click', () => { state.stack = 'supa'; updateUI(); btnS.classList.add('active'); if(btnF) btnF.classList.remove('active'); });
    if(btnF) btnF.addEventListener('click', () => { state.stack = 'fire'; updateUI(); btnF.classList.add('active'); if(btnS) btnS.classList.remove('active'); });

    document.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', e => {
        document.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        state.userCount = parseInt(e.target.dataset.val);
        updateUI();
    }));

    updateUI();
});
