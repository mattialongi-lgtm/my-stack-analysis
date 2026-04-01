document.addEventListener('DOMContentLoaded', () => {
    // --- State & Config ---
    const state = {
        stack: 'supa', // 'supa' (Supabase/Gemini) or 'fire' (Firebase/GCS)
        users: 1000
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
                { domain: 'Backend Compute', type: 'PaaS', resp: 'Provider: VM/Runtime. Dev: Express Logic.' },
                { domain: 'Database (SQL)', type: 'BaaS', resp: 'Provider: DB Ops/Backups. Dev: Schema/SQL.' },
                { domain: 'AI Service', type: 'SaaS', resp: 'Provider: Model Infra. Dev: Prompts/Keys.' },
                { domain: 'Auth / Storage', type: 'BaaS', resp: 'Provider: Security. Dev: Token/Bucket rules.' }
            ],
            costs: {
                '100': { 
                    total: 10, 
                    note: "Render (Free) + Supabase (Free): Minimal hosting overhead (Render overage $7). Gemini API calls included up to 1k/mo." 
                },
                '1000': { 
                    total: 45, 
                    note: "Render Starter ($7) + Supabase Pro ($25): Robust DB tier with RLS & Backups. Pay-as-you-go Gemini API (~$10/mo)." 
                },
                '10000': { 
                    total: 140, 
                    note: "High Volume: Render Professional ($19) + Supabase Pro ($25) + Bandwidth overages (~$20) + Heavy Gemini API usage (~$80)." 
                }
            },
            lockin: {
                fin: 'Supabase flat tiers are predictable. Render scales linearly.',
                proc: 'Low. Standard Express/Postgres skills. Portable to any VPS.',
                data: 'Minimal. Full SQL dumps mean you can leave Supabase in hours.'
            },
            risk: 'Backend scaling. Express on Render needs manual horizontal scaling configuration as you hit 5k+ concurrent users.'
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
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: GCP Network. Dev: React Build.' },
                { domain: 'Backend Compute', type: 'PaaS (CaaS)', resp: 'Provider: Auto-scaler. Dev: Docker/Image.' },
                { domain: 'Database (NoSQL)', type: 'BaaS/PaaS', resp: 'Provider: Global Dist. Dev: Denormalization.' },
                { domain: 'AI Service', type: 'PaaS', resp: 'Provider: Google Vertex. Dev: Vertex Pipelines.' },
                { domain: 'Auth / Storage', type: 'BaaS', resp: 'Provider: IAM Unified. Dev: Security Rules.' }
            ],
            costs: {
                '100': { 
                    total: 2, 
                    note: "Spark Plan (Free): Auth, Firestore, and Hosting are free below threshold. Minimal Cloud Run compute unit charges." 
                },
                '1000': { 
                    total: 25, 
                    note: "Blaze Plan (Pay-as-you-go): Cloud Run compute (~$10), Firestore read/write ops (~$5), and Vertex AI Gemini tokens (~$10)." 
                },
                '10000': { 
                    total: 95, 
                    note: "GCP Elastic Scaling: Cloud Run (~$25 auto-scaling), Firestore high-volume NoSQL ($30), and Vertex AI processed tokens ($40)." 
                }
            },
            lockin: {
                fin: 'Usage-based spikes can be dangerous if a loop is introduced in code.',
                proc: 'High. Knowledge of GCP IAM, Cloud Build, and Vertex SDK is specialized.',
                data: 'Moderate. Firestore NoSQL is harder to export to SQL later. Denormalized data silos happen.'
            },
            risk: 'IAM Complexity. Misconfiguring Google Cloud IAM roles can lead to "Silent Failures" and severe security leaks.'
        }
    };

    // --- DOM Elements ---
    const btnSupa = document.getElementById('btn-supa');
    const btnFire = document.getElementById('btn-fire');
    const segBtns = document.querySelectorAll('.seg-btn');
    const classBody = document.getElementById('class-body');
    const priceSupa = document.getElementById('price-supa');
    const priceFire = document.getElementById('price-fire');
    const barSupa = document.getElementById('bar-supa');
    const barFire = document.getElementById('bar-fire');
    const boxBackend = document.getElementById('box-backend');
    const labelBackend = document.getElementById('label-backend');
    const boxDatabase = document.getElementById('box-database');
    const boxStorage = document.getElementById('box-storage');
    const boxAi = document.getElementById('box-ai');
    const labelArch = document.getElementById('arch-type-label');
    const lockFin = document.getElementById('lock-fin');
    const lockProc = document.getElementById('lock-proc');
    const lockData = document.getElementById('lock-data');
    const totalTimeLabel = document.getElementById('total-time');

    // --- Update Logic ---
    const updateUI = () => {
        const stack = data[state.stack];
        const isSupa = state.stack === 'supa';

        // 1. Toggle Button Styles
        btnSupa.classList.toggle('active', isSupa);
        btnFire.classList.toggle('active', !isSupa);

        // 2. Diagram Update
        boxBackend.textContent = stack.arch.backend;
        labelBackend.textContent = stack.arch.backendLabel;
        boxDatabase.textContent = stack.arch.db;
        boxDatabase.nextElementSibling.textContent = stack.arch.dbLabel;
        boxStorage.textContent = stack.arch.storage;
        boxAi.textContent = stack.arch.ai;
        boxAi.nextElementSibling.textContent = stack.arch.aiLabel;
        labelArch.textContent = isSupa ? "Current Stack: Modular BaaS" : "Alternative: Unified GCP Core";

        // 3. Classification Table
        classBody.innerHTML = stack.classification.map(item => `
            <tr>
                <td><strong>${item.domain}</strong></td>
                <td><span class="badge" style="border: 1px solid rgba(255,255,255,0.1)">${item.type}</span></td>
                <td>${item.resp}</td>
            </tr>
        `).join('');

        // 4. Costing
        const sCost = data.supa.costs[state.users];
        const fCost = data.fire.costs[state.users];
        
        priceSupa.textContent = `$${sCost.total}`;
        priceFire.textContent = `$${fCost.total}`;

        const maxVal = Math.max(sCost.total, fCost.total, 150);
        document.getElementById('note-supa').querySelector('.content').textContent = sCost.note;
        document.getElementById('note-fire').querySelector('.content').textContent = fCost.note;
        
        // Indicate which note is related to the ACTIVE stack selection visually
        document.getElementById('note-supa').style.opacity = isSupa ? "1" : "0.5";
        document.getElementById('note-fire').style.opacity = isSupa ? "0.5" : "1";
        
        // 5. Analysis
        lockFin.textContent = stack.lockin.fin;
        lockProc.textContent = stack.lockin.proc;
        lockData.textContent = stack.lockin.data;

        // 6. Risks
        document.getElementById('risk-current').style.opacity = isSupa ? "1" : "0.4";
        document.getElementById('risk-alt').style.opacity = isSupa ? "0.4" : "1";
        
        // 7. Migration Time logic
        totalTimeLabel.textContent = isSupa ? "Status: Operational" : "~12 Working Days";
    };

    // --- Events ---
    btnSupa.addEventListener('click', () => { state.stack = 'supa'; updateUI(); });
    btnFire.addEventListener('click', () => { state.stack = 'fire'; updateUI(); });

    segBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            segBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.users = parseInt(e.target.dataset.val);
            updateUI();
        });
    });

    // Initial Trigger
    updateUI();
});
