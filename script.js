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
                { area: 'DB', desc: 'No changes needed (Current Stack).', effort: 'N/A', class: 'low' },
                { area: 'AI', desc: 'Direct Gemini API access.', effort: 'N/A', class: 'low' }
            ],
            lockin: { fin: 'Predictable billing tiers.', proc: 'Low. SQL skills are universal.', data: 'Postgres is standard SQL.' },
            risks: 'Postgres scales well, but intensive custom logic in the Node.js backend can become a bottleneck without horizontal scaling.'
        },
        fire: {
            arch: {
                backend: 'Cloud Run Service', backendLabel: 'GCP Containerized Node',
                db: 'Cloud Firestore', dbLabel: 'NoSQL / Global Scale',
                storage: 'Firebase Storage', ai: 'Vertex AI Gemini Pro', aiLabel: 'GCP AI Platform'
            },
            classification: [
                { domain: 'Frontend', type: 'PaaS', resp: 'Provider: Edge. Dev: Content.' },
                { domain: 'Backend', type: 'CaaS', resp: 'Provider: GCR. Dev: Containers.' },
                { domain: 'Database', type: 'BaaS', resp: 'Provider: Firestore. Dev: NoSQL.' }
            ],
            migration: [
                { area: 'DB Indexing', desc: 'Redesigning SQL to NoSQL Schema.', effort: 'High: 5 Days', class: 'high' },
                { area: 'Cloud Run', desc: 'Containerizing Express service.', effort: 'Mid: 3 Days', class: 'mid' },
                { area: 'Vertex SDK', desc: 'Porting to GCP Vertex client.', effort: 'Low: 1 Day', class: 'low' }
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

        // 1. Classification
        const grid = document.getElementById('class-grid');
        if(grid) grid.innerHTML = s.classification.map(i => `
            <div class="class-item">
                <div class="class-header"><strong>${i.domain}</strong><span class="badge">${i.type}</span></div>
                <div class="class-resp">${i.resp}</div>
            </div>`).join('');

        // 2. Migration
        const mGrid = document.getElementById('assess-grid');
        if(mGrid) mGrid.innerHTML = s.migration.map(i => `
            <div class="assess-item">
                <div class="assess-header">${i.area}: Shift</div>
                <div class="assess-desc">${i.desc}</div>
                <div class="effort-tag ${i.class}">${i.effort}</div>
            </div>`).join('');

        // 3. Diagram
        document.getElementById('box-backend').textContent = s.arch.backend;
        document.getElementById('label-backend').textContent = s.arch.backendLabel;
        document.getElementById('box-database').textContent = s.arch.db;
        document.getElementById('label-database').textContent = s.arch.dbLabel;
        document.getElementById('box-storage').textContent = s.arch.storage;
        document.getElementById('box-ai').textContent = s.arch.ai;
        document.getElementById('label-ai').textContent = s.arch.aiLabel;

        // 4. Costs
        const sC = calculateCosts('supa', state.userCount);
        const fC = calculateCosts('fire', state.userCount);
        const maxScale = Math.max(sC.total, fC.total, 80);
        document.getElementById('price-supa').textContent = `$${Math.round(sC.total)}`;
        document.getElementById('price-fire').textContent = `$${Math.round(fC.total)}`;
        document.getElementById('bar-supa-fixed').style.width = `${(sC.fixed/maxScale)*100}%`;
        document.getElementById('bar-supa-var').style.width = `${(sC.variable/maxScale)*100}%`;
        document.getElementById('bar-fire-var').style.width = `${(fC.variable/maxScale)*100}%`;

        // 5. Analysis
        document.getElementById('lock-fin').textContent = s.lockin.fin;
        document.getElementById('lock-proc').textContent = s.lockin.proc;
        document.getElementById('lock-data').textContent = s.lockin.data;

        // 6. Risks (FIXED)
        document.getElementById('risk-p-curr').textContent = data.supa.risks;
        document.getElementById('risk-p-alt').textContent = data.fire.risks;
        document.getElementById('risk-current').style.opacity = isS ? "1" : "0.35";
        document.getElementById('risk-alt').style.opacity = isS ? "0.35" : "1";
    };

    document.getElementById('btn-supa').addEventListener('click', () => { state.stack = 'supa'; updateUI(); document.getElementById('btn-supa').classList.add('active'); document.getElementById('btn-fire').classList.remove('active'); });
    document.getElementById('btn-fire').addEventListener('click', () => { state.stack = 'fire'; updateUI(); document.getElementById('btn-fire').classList.add('active'); document.getElementById('btn-supa').classList.remove('active'); });
    document.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', e => {
        document.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        state.userCount = parseInt(e.target.dataset.val);
        updateUI();
    }));
    updateUI();
});
