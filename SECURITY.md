# Security / Güvenlik

Never put tokens, `.env` files or personal information in issues, PRs or logs. If a token is exposed, reset it immediately in Discord Developer Portal and replace local configuration.

For a security report, use the repository's private **Security → Report a vulnerability** flow if enabled. If private reporting is unavailable, contact the repository owner through an existing trusted private channel; do not publish exploitable details or credentials in a public issue. This project offers no response-time guarantee.

Token, `.env` ve kişisel bilgileri issue/PR/loglara koymayın. Token açığa çıktıysa Portal'da hemen sıfırlayıp yerel ayarı değiştirin. Güvenlik açığını varsa deponun özel **Security → Report a vulnerability** kanalından bildirin; yoksa depo sahibinin mevcut güvenilir özel iletişim yolunu kullanın. Herkese açık issue'da istismar ayrıntısı/sır yayımlamayın. Yanıt süresi garantisi verilmez.

The bot processes submitted interaction data, checks fresh publishing permissions, expires bounded in-memory drafts and never requires privileged intents or Administrator. These safeguards do not replace Discord/host access controls or a full security audit. Source credential scans are pattern-based and can miss secrets. Dependency audits reflect the registry's known advisories at check time.

Bot yalnızca gönderilmiş etkileşim verisini işler; paylaşım izinlerini yeniden denetler ve sınırlı RAM önizlemelerini süreli tutar. Ayrıcalıklı intent veya Administrator gerekmez. Önlemler Discord/barındırma erişim kontrollerinin veya kapsamlı güvenlik denetiminin yerine geçmez. Desen taraması sır kaçırabilir; bağımlılık denetimleri kontrol anındaki bilinen duyurularla sınırlıdır.
