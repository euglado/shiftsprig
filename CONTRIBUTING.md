# Contributing / Katkı

Open a small issue describing expected behavior, actual behavior, Node/OS versions and a synthetic reproduction without tokens or personal data. Discuss scope before adding storage, new permissions or external services.

Use Node.js 24, run `npm ci --ignore-scripts`, then `npm run check` and `npm audit --audit-level=low`. On a machine with Bash, also run `bash -n setup.sh start.sh register.sh`. Keep a real `.env` outside your clean check tree. Tests compile before execution; missing test modules fail explicitly. For behavior changes, add tests covering the user-facing failure/boundary cases, not just the implementation shape.

Keep Turkish/English installation and privacy docs aligned. Do not add privileged intents, user token automation, tracking, automatic public posting or unbounded state. New dependencies require compatible license metadata and integrity-pinned lockfile entries. No live Discord tokens belong in CI.

Beklenen/gerçek davranış, Node/işletim sistemi sürümü ve yapay, kişisel veri içermeyen küçük örnekle issue açın. Depolama, yeni izin veya harici servis eklemeden kapsamı konuşun. Node 24 ile yukarıdaki kontrolleri çalıştırın. Gerçek `.env` dosyasını temiz kontrol ağacının dışında tutun. Davranış değişikliğinde kullanıcıyı etkileyen hata ve sınır durumlarını test edin. Türkçe/İngilizce belgeleri birlikte güncelleyin; ayrıcalıklı intent, takip, otomatik herkese açık gönderim veya sınırsız durum eklemeyin. CI'ye canlı token koymayın.

Submit focused pull requests with concrete commit titles and actual validation results. Contributions are provided under this repository's MIT license. / Küçük PR, somut commit başlığı ve gerçek test sonuçları gönderin. Katkılar deponun MIT lisansı kapsamındadır.
