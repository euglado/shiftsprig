# ShiftSprig

[Türkçe](#türkçe) · [English](#english) · MIT

## Türkçe

### Amaç

ShiftSprig, Discord topluluklarının gönüllü etkinlikleri için eşit süreli vardiya planları hazırlamasına yardım eden gerçek bir Discord botudur. Park temizliği, topluluk standı, çevrim içi yardım masası veya etkinlik karşılama ekibi için başlangıcı, vardiya sayısını ve süresini seçin. Önce yalnızca sizin gördüğünüz bir plan çıkar. **Paylaş** düğmesine basarsanız başlık ve saatler bulunduğunuz kanala gönderilir. **Vazgeç** hiçbir şey yayımlamaz.

Bot katılımcı kaydetmez, insanları vardiyalara atamaz, nöbet takibi yapmaz, DM veya hatırlatma göndermez. Bir takvim servisi, alarm veya mesai/ücret hesaplayıcısı değildir. Vardiya kartları otomatik güncellenmez; gerçek görev dağılımını topluluğunuz kendi yöntemiyle yapar. Mesaj okumaz, ses kanallarına bağlanmaz, bağlantı açmaz ve harici servis kullanmaz. Bu depo kendi uygulamanızla çalıştıracağınız kaynak kodudur; hazır, sürekli çevrim içi ortak bot hizmeti sunmaz.

### Özellikler ve sınırlar

- `/shiftsprig` ile tek satırlık başlık, açık UTC ofsetli başlangıç, 1–12 vardiya, vardiya başına 5–240 dakika ve aralara 0–60 dakika boşluk.
- Türkçe ve İngilizce özel önizleme; tek kullanımlık **Paylaş / Vazgeç** düğmeleri. Önizleme 5 dakika geçerlidir ve yalnızca onu oluşturan kişi aynı kanalda kullanabilir.
- Discord tarih etiketleri, her izleyicinin Discord istemcisinde kendi yerel saatini gösterir. Her satırda başlangıç ve bitiş tarihi vardır; gece yarısı geçişi gizlenmez.
- Sabit geçen süreler kullanılır. Boşluk, bir vardiyanın bitişi ile sonrakinin başlangıcı arasındadır; son vardiyadan sonra eklenmez. Bir boşluk, örtüşen devir teslim süresi değildir.
- Başlangıç formatı tam olarak `YYYY-MM-DDTHH:mmZ` veya `YYYY-MM-DDTHH:mm±HH:mm` olmalıdır. Örnek: `2026-10-15T10:00+03:00` ile `2026-10-15T07:00Z` aynı anı belirtir. Saniye, yerel saat dilimi adı, ofsetsiz saat ve bilinmeyen ofset anlamındaki `-00:00` kabul edilmez. Ofset en çok ±14:00 olabilir. Başlangıç ve tüm bitişler UTC olarak 2000–2100 aralığında kalmalıdır; geçmiş tarih girişi mümkündür.
- Yaz/kış saati geçişinde de vardiya süresi sabittir. Ofseti siz seçersiniz; bot bir şehir için doğru ofseti bulmaz. Yanlış ofset doğru görünen ama yanlış bir an üretir. Önizlemede kendi yerel saatinizi kontrol edin.
- Başlık kırpıldıktan sonra 1–80 UTF-16 birimidir; satır sonu, kontrol ve görünmez yönlendirme karakterleri reddedilir. Markdown ve mention benzeri metin etkisizleştirilir; başlıkta bazı karakterler tam genişlikli görünebilir. Bağlantı önizlemeleri ve mention bildirimleri kapalıdır.
- Bir sunucu, bir çalışan süreç. Normal metin ve duyuru kanalları desteklenir; thread, forum, DM, ses ve kategori desteklenmez. Duyuru mesajları otomatik çapraz yayımlanmaz.
- Kişi başına yeni önizlemeler arasında 5 saniye; kanal başına paylaşımlar arasında 60 saniye. En çok 100 etkin önizleme ve her hız sınırlama haritasında 500 kayıt. Kapasite dolunca işlem açık hata ile durur. Süresi dolmuş kayıtlar 30 saniyelik temizlikte veya bir sonraki işlemde kaldırılır.

### Gereksinimler

Windows, macOS veya Linux; [Node.js 24 LTS](https://nodejs.org/en/download) ve beraberindeki npm; internet bağlantısı; Discord hesabı ve bot ekleyebileceğiniz bir sunucu gerekir. Bot çevrim içi kalacaksa bilgisayarın açık, internete bağlı ve uykuya geçmemiş olması gerekir. Kaynak düzenleme veya veritabanı kurulumu gerekmez. Git isteğe bağlıdır; GitHub'da **Code → Download ZIP** kullanabilirsiniz.

### Developer Portal ve izinler

1. [Discord Developer Portal](https://discord.com/developers/applications) içinde **New Application** ile kendinize bir uygulama oluşturun. **General Information → Application ID** değerini kopyalayın; bu, bot tokenı değildir.
2. **Bot** bölümünde token oluşturun veya **Reset Token** kullanın. Tokenı yalnızca kurulum terminaline yapıştırın; sohbetlere, ekran görüntülerine, GitHub'a veya destek taleplerine göndermeyin. Kullanıcı şifresi, OAuth istemci sırrı veya normal kullanıcı tokenı kullanmayın.
3. **Privileged Gateway Intents** altındaki Message Content, Server Members ve Presence seçeneklerini kapalı bırakın. Kodun kullandığı tek intent `Guilds` olup ayrıcalıklı değildir. **Interactions Endpoint URL** alanını bu kurulum için boş bırakın; bot Gateway bağlantısı kullanır. HTTP sunucusu veya açık gelen port gerekmez.
4. **Installation** içinde Guild Install (sunucu kurulumu) seçin; User Install gerekmez. Sunucu kurulumu için `bot` ve `applications.commands` kapsamlarını seçin. Bot izinleri yalnızca **View Channels / Kanalı Görüntüle** ve **Send Messages / Mesaj Gönder** olsun (izin değeri `3072`). Administrator, Manage Messages, Manage Channels, Manage Roles, Read Message History, Embed Links, Attach Files veya Mention Everyone istemeyin.
5. Oluşturulan kurulum bağlantısını açıp test sunucunuzu seçin. Bot eklemek için kendi hesabınızın sunucuda gerekli yönetim yetkisi olmalıdır; bu yetkiyi bot rolüne vermeyin. Discord arayüzündeki bölüm adları değişirse resmi [komut](https://docs.discord.com/developers/interactions/application-commands), [etkileşim](https://docs.discord.com/developers/interactions/receiving-and-responding) ve [izin](https://docs.discord.com/developers/topics/permissions) belgelerine bakın.
6. Discord **User Settings → Advanced → Developer Mode** seçeneğini açın. Sunucu simgesine sağ tıklayıp **Copy Server ID** kullanın. Kanal kimliği yerine sunucu kimliğini alın.
7. Kullanacağınız kanalın izinlerinde hem kullanıcıların hem botun Kanalı Görüntüle ve Mesaj Gönder hakkı olsun. Kullanıcıların ayrıca uygulama komutlarını kullanabilmesi gerekir. Sunucu yöneticileri **Server Settings → Integrations → ShiftSprig** üzerinden komut erişimini organizatör rolleriyle sınırlayabilir. Bot varsayılan olarak komut kullanabilen üyelerin plan yapmasına izin verir; otomatik moderasyon yapmaz.

### Kurulum

1. Bu depoyu indirin, ZIP ise tamamen çıkarın. Klasörü herkesin erişemediği bir konuma koyun. Node.js kurulumundan sonra yeni terminal açın.
2. Windows'ta `setup.cmd` dosyasını çalıştırın; macOS/Linux'ta klasörde terminal açıp `bash setup.sh` yazın. Yardımcılar kilit dosyasından bağımlılıkları, kurulum betiklerini çalıştırmadan kurar; TypeScript kodunu derler ve yapılandırma sihirbazını açar. Terminali elle kullanmak isterseniz:

   ```sh
   npm ci --ignore-scripts
   npm run build
   npm run setup
   ```

3. Sihirbaza Application ID, Server ID ve bot tokenını girin. Token yazılırken görünmez; Enter ile bitirin, Esc/Ctrl+C ile iptal edin. Görünmemesi giriş yapılmadığı anlamına gelmez. Etkileşimli terminal zorunludur; yönlendirilmiş giriş kabul edilmez. Yapıştırma sorunu olursa terminalin yapıştır komutunu kullanın; tokenı komut satırına argüman olarak yazmayın.
4. Ayarlar yerel `.env` dosyasına kaydedilir. Mevcut dosyanın üzerine yazılmaz. Değiştirmek için botu durdurun, mevcut `.env` dosyasını güvenli bir konuma taşıyın ve sihirbazı yeniden açın. Eski tokenın yedeğini gereksiz yere tutmayın. `.env.example` örneğine gerçek token yazmayın.
5. Windows'ta `register.cmd`; macOS/Linux'ta `bash register.sh` çalıştırın. Elle: `npm run register`. Bu işlem yalnızca bu uygulamanın yapılandırılmış sunucusundaki `/shiftsprig` komutunu oluşturur/günceller; başka komutları topluca silmez. Kurulumdan ve komut şeması değişikliklerinden sonra kaydetmek yeterlidir; her başlangıçta kayıt yapmayın.
6. Windows'ta `start.cmd`; macOS/Linux'ta `bash start.sh` çalıştırın. Elle: `npm start`. Terminalde “ShiftSprig ready / hazır” görününce Discord'da deneyin. Botu durdurmak için terminalde Ctrl+C kullanın. Terminal kapanınca bot da kapanır.

### Yapılandırma

Sihirbaz üç değer ister: `DISCORD_TOKEN` bot sırrıdır; `DISCORD_APPLICATION_ID` Portal'daki uygulamadır; `DISCORD_GUILD_ID` tek hedef sunucudur. Ek ayar, veritabanı veya kaynak kod değişikliği gerekmez. Barındırma sağlayıcınız bu üç değeri gizli ortam değişkenleri olarak verebilir; bu durumda `.env` kullanmayın. Mevcut süreç ortamındaki değerler `.env` değerlerinden önceliklidir; beklenmeyen sunucu/token kullanımında eski ortam değişkenlerini kontrol edin. Kimlikler kayıttan önce biçim olarak, uygulama kimliği ise bot bağlandığında gerçekten kontrol edilir.

### Kullanım

Discord'da normal bir metin kanalında `/shiftsprig` seçin. Örnek alanlar: `title: Park gönüllüleri`, `start: 2026-10-15T10:00+03:00`, `shifts: 3`, `minutes: 30`, `gap: 10`, `language: tr`.

Bu plan UTC+03:00 için 10:00–10:30, 10:40–11:10 ve 11:20–11:50 vardiyalarını üretir. Başka saat dilimindeki üyeler aynı anları kendi yerel saatinde görür. `gap` verilmezse 0'dır. Dil seçilmezse Türkçe Discord yerel ayarında Türkçe, diğer ayarlarda İngilizce kullanılır.

Özel önizlemeyi okuyun. **Paylaş** başlık ve tüm vardiya saatlerini aynı kanala herkese açık gönderir; **Vazgeç** önizlemeyi kaldırır. Düğme başkasına, başka kanala veya başka mesaja taşınamaz. Paylaşım veya vazgeçme girişimi önizlemeyi tüketir; izin/ağ sorunu olursa yeni önizleme gerekir. Sonucun belirsiz olduğu bir ağ hatasında tekrar denemeden önce kanalı kontrol edin. Otomatik uygulama tekrar gönderimi yoktur; REST 5xx tekrarları kapalıdır, SDK Discord hız sınırlarına uymak için bekleyebilir.

Düzeltme için yeni plan oluşturun. Eski kartı, gerekli yetkisi olan bir insan silebilir; bot geçmiş mesajları taramaz, düzenlemez veya silmez. Mobil ve ekran okuyucuda gerçek kullanılabilirliği kendi topluluğunuzla doğrulayın; düğmeler metin etiketlidir ve bilgi yalnızca renkle aktarılmaz.

### Botu çalışır tutma

Tek bir sürekli çalışan Node.js 24 süreci yeterlidir. Yerel bilgisayar kapanırsa, uyursa veya bağlantısı kesilirse komutlar cevap vermez. 24/7 kullanım için Node 24 destekleyen bir sunucu/servis seçin, gizli ortam değişkenlerini girin, başlangıçta `npm ci --ignore-scripts` ve `npm run build` çalıştırın, çalışma komutunu `npm start` yapın. Çalışma dizini proje kökü olmalıdır. Sağlayıcının “uykuya alma” seçeneğini kontrol edin; yalnızca aralıklı GitHub Actions çalıştırmak botu çevrim içi tutmaz. Sırları CI'ye koymanız gerekmez. Tek süreç çalıştırın; çoklu kopyalar hız sınırlamasını paylaşmaz. Yeniden başlatmada bekleyen önizlemeler ve geçici hız kayıtları kaybolur, eski düğmeler geçersiz olur; zaten yayımlanmış kartlar Discord'da kalır.

### Güvenlik ve gizlilik

Bot yalnızca size iletilen slash komutlarını/düğmeleri işler. Başlık, başlangıç ve tercihler Discord ile bot sürecine ulaşır. Paylaşılmadan önce özel yanıtlar Discord üzerinden teslim edilir; gizlilik garantisi veya uçtan uca şifreleme anlamına gelmez. Başlığa kişisel bilgi, iletişim bilgisi veya sır yazmayın. RAM'de bekleyen önizleme; oluşturucu, sunucu, kanal ve mesaj kimlikleri, kart dili, kart metni ve son kullanım zamanını tutar. Komut etkileşim nesnesi önizleme deposunda saklanmaz. Önizleme en çok 5 dakika; kullanıcı/kanal hız kayıtları 5/60 saniye geçerlidir ve temizlik en çok 30 saniye gecikebilir. Veritabanı, dosya geçmişi, analitik, izleyici listesi veya telemetri yoktur. SDK mesaj/üye/kullanıcı önbellekleri kapalıdır; sunucu/kanal bağlantı metadatası SDK tarafından tutulabilir.

RAM kaydını silmek Discord mesajını silmez. Özel yanıtlar ve herkese açık kartlar Discord'un saklama kurallarına tabidir ve süre bitiminden sonra ekranda kalabilir. Kapanışta bot kendi geçici haritalarını boşaltır; bellek sıfırlama veya Discord'dan silme garantisi vermez. Bot/API hataları token veya kullanıcı metni olmadan genel ifadelerle yazılır. Sunucu sağlayıcınızın log ve erişim ayarlarını ayrıca yönetin.

`.env` Git tarafından yok sayılır. Unix'te oluşturulurken dosya izni 0600 istenir; Windows'ta NTFS erişimini hesabınızla sınırlandırın. Dosyayı bulutla paylaşılan veya herkese açık klasöre koymayın. Sızıntı olursa Portal'da **Reset Token** yapın, yerel yapılandırmayı yenileyin ve botu yeniden başlatın. Ayrıntı için [SECURITY.md](SECURITY.md).

### Sorun giderme

- **npm/node bulunamadı:** Node.js 24 LTS kurun; terminali yeniden açın. PowerShell yürütme ilkesi npm.ps1'i engellerse `npm.cmd` kullanın veya `.cmd` yardımcılarını çalıştırın. Güvenlik ilkesini kapatmanız gerekmez.
- **Derleme bulunamadı:** Proje kökünde `npm ci --ignore-scripts` ve `npm run build` çalıştırın. ZIP'ten yalnızca bir dosyayı çalıştırmayın.
- **Kurulum durdu:** Etkileşimli terminal açın, ID'leri kontrol edin. `.env` varsa üzerine yazılmaz; güvenli şekilde taşıyıp yeniden deneyin. Token hatalarını ekran görüntüsünde paylaşmayın.
- **Kayıt başarısız / 401:** Bot tokenını ve Application ID'yi kontrol edin. Normal kullanıcı tokenı kullanmayın. Gerekirse tokenı sıfırlayın. 403/404 için botun doğru sunucuda kurulu ve Server ID'nin doğru olduğuna bakın.
- **Komut görünmüyor:** Önce register yardımcısını çalıştırın. Doğru sunucuyu, `applications.commands` kapsamını, komut izinlerini kontrol edin; Discord istemcisini yenileyin. Komut yalnızca yapılandırılmış sunucuda kayıtlıdır.
- **Bot çevrim dışı / yanıt yok:** Start terminalini, ağınızı ve bilgisayarın uyku durumunu kontrol edin. Interactions Endpoint URL boş olmalıdır. Token değiştiyse yeniden başlatın.
- **İzin uyarısı:** Kanal üstündeki özel izinleri ve kategori kalıtımını kontrol edin; hem kullanıcı hem bot Kanalı Görüntüle/Mesaj Gönder iznine sahip olmalı. Yönetici vermek çözüm olarak gerekmez.
- **Tarih reddedildi / saat yanlış:** Büyük `T` ve `Z` veya açık `+03:00` benzeri ofset kullanın; saniye eklemeyin. Gerçek takvim günü ve doğru etkinlik ofsetini seçin. Yaz/kış saatinde ofseti kendiniz doğrulayın; Discord cihazının saat dilimini de kontrol edin.
- **Önizleme geçersiz:** 5 dakika geçti, bot yeniden başladı, düğme kullanıldı veya farklı bir kullanıcı/mesaj söz konusu. Yeni `/shiftsprig` önizlemesi açın.
- **Gönderim doğrulanamadı:** İletim gerçekleşmiş olabilir. Tekrar denemeden önce kanala bakın; bot otomatik tekrar göndermez. Rate limit/kapasite mesajında belirtilen süreyi bekleyin.

### Testler, katkı ve lisans

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/launch.mjs
node --check scripts/check-supply.mjs
bash -n setup.sh start.sh register.sh
```

`check`: Biome recommended lint/format/import kontrolü, strict TypeScript (bağımlılık türleri dahil), açıkça listelenmiş test dosyaları ve tedarik/gizli bilgi kontrolü. Testler ofsetler, geçersiz tarihler, artık yıllar, boşluk/süre sınırları, gece yarısı/yaz saati, Unicode/mention kaçışı, kart uzunluğu, düğme sahibi/mesaj bağları, kapasite, eşzamanlı tıklama, izin/API hataları ve yapılandırmasız güvenli başlangıcı kapsar. Test etkileşimleri taklittir; canlı Discord kurulumu, token girişi, mobil/ekran okuyucu ve 24/7 hosting ayrıca denenmelidir. Canlı test tokenı CI için gerekmez. VDS testi bu proje doğrulamasında kullanılmamıştır.

Tedarik kontrolü kilit dosyasındaki bağımlılık lisanslarını izin listesiyle, npm kayıt kaynağını, SHA-512 bütünlük metadatasını ve kurulum betiği bulunmamasını doğrular. Kaynak taraması yaygın GitHub/Discord token ve özel anahtar desenlerini arar; tüm sırları yakalayan kapsamlı güvenlik denetimi değildir. Bilinen açık kontrolü `npm audit` ile ayrıdır. Yerel `.env` varsa kaynak taraması bilerek durur; sır dosyasını güvenli şekilde çalışma ağacının dışına taşıyın veya temiz bir geliştirme kopyası kullanın. CI temiz kopyada Ubuntu, Windows ve macOS üzerinde aynı kontrolleri ve Bash sözdizimini çalıştırır; yalnızca `contents: read` izni vardır ve action sürümleri commit SHA ile sabitlenmiştir.

Katkı için [CONTRIBUTING.md](CONTRIBUTING.md) içindeki akışı izleyin. Gerçek token ve kişisel veri içermeyen küçük hata örnekleri gönderin. Kod [MIT lisansı](LICENSE) ile yayımlanır; üçüncü taraf bağımlılıkların lisansları kendilerine aittir. Discord [Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) ve hizmet kurallarına uymak operatörün sorumluluğundadır.

## English

### Purpose

ShiftSprig is a real Discord bot that helps communities plan equal-duration volunteer shifts for cleanups, community booths, welcome desks or online help events. Choose a start, a shift count and a duration. Inspect a private preview, then explicitly choose **Share** to publish the title and full schedule in the same channel. **Discard** publishes nothing.

It does not collect signups, assign people, track attendance, send DMs or reminders, calculate wages, or provide alarms/calendar synchronization. Published cards do not update automatically. Arrange actual staffing separately. It does not read messages, connect to voice, open links or contact external services. This repository is source for a bot you operate with your own Discord application; it is not an invitation to a shared hosted bot.

### Features and limits

- `/shiftsprig`: visible single-line title, start with explicit UTC offset, 1–12 shifts of 5–240 minutes and a 0–60 minute gap between them.
- Turkish/English private preview and one-use **Share / Discard** controls. Only the creator can use their preview, in the original channel/message, for five minutes.
- Native Discord timestamps display each instant in each viewer's local timezone. Both ends include a date, so overnight shifts remain clear.
- Durations are fixed elapsed minutes. The gap is empty time between one shift ending and the next starting; it is not an overlapping handover. There is no gap after the final shift.
- Exact start syntax: `YYYY-MM-DDTHH:mmZ` or `YYYY-MM-DDTHH:mm±HH:mm`. `2026-10-15T10:00+03:00` and `2026-10-15T07:00Z` identify the same instant. Seconds, timezone names, missing offsets and the unknown offset `-00:00` are rejected. Maximum offset is ±14:00. Start and all ends must fall within UTC years 2000–2100; past dates are allowed.
- You supply the correct event offset. The bot does not resolve a city's daylight-saving rules. Across a clock change, elapsed durations remain constant. Check your local preview before publishing.
- Trimmed titles are 1–80 UTF-16 units. Newlines, control and invisible formatting characters are rejected. Markdown/mentions are neutralized; some characters display in fullwidth form. Link embeds and mention notifications are disabled.
- One configured guild and one running process. Regular text and announcement channels only; no threads, forums, DMs, voice or categories. Announcement messages are never automatically crossposted.
- Five seconds between a person's previews, sixty seconds between a channel's shares; maximum 100 active previews and 500 entries per cooldown map. Capacity errors stop the action. Expired records are pruned every thirty seconds and on subsequent operations.

### Requirements

Windows, macOS or Linux, [Node.js 24 LTS](https://nodejs.org/en/download) with npm, internet access, a Discord account, and permission to install an application in a server. The machine must stay awake and connected for the bot to respond. No database or source editing is needed. Git is optional: use GitHub **Code → Download ZIP**, then extract the complete folder.

### Developer Portal and permissions

1. Create **New Application** in the [Discord Developer Portal](https://discord.com/developers/applications). Copy **General Information → Application ID**; this is not the token.
2. On **Bot**, generate/reset the bot token. Paste it only into the setup terminal. Never share it in chat, screenshots, GitHub or support requests. Do not use an account password, OAuth client secret or user token.
3. Leave Message Content, Server Members and Presence privileged intents off. Code enables only the unprivileged `Guilds` intent. Leave **Interactions Endpoint URL** empty: this bot uses Gateway, with no inbound HTTP server or open port.
4. Under **Installation**, use Guild Install; User Install is unnecessary. Select `bot` and `applications.commands` scopes. Grant only **View Channels** and **Send Messages** (permission integer `3072`). Do not grant Administrator, Manage Messages/Channels/Roles, Read Message History, Embed Links, Attach Files or Mention Everyone.
5. Open the generated installation link and select your test server. Your own account needs permission to install the app; do not give that management permission to the bot. If Portal labels change, consult official [commands](https://docs.discord.com/developers/interactions/application-commands), [interactions](https://docs.discord.com/developers/interactions/receiving-and-responding) and [permissions](https://docs.discord.com/developers/topics/permissions) documentation.
6. Enable Discord **User Settings → Advanced → Developer Mode**. Right-click the server icon and **Copy Server ID**. Do not copy a channel ID instead.
7. Allow both the bot and users to View Channel and Send Messages in the target channel. Users also need Use Application Commands. Administrators can restrict `/shiftsprig` to organizer roles through **Server Settings → Integrations → ShiftSprig**. By default, members allowed to invoke commands can create plans; the bot does not moderate their content.

### Installation

1. Download and fully extract the repository into a private folder. Install Node.js 24, then open a new terminal.
2. Windows: run `setup.cmd`. macOS/Linux: open a terminal in the folder and run `bash setup.sh`. These helpers install locked dependencies with install scripts disabled, compile TypeScript and open the setup wizard. Equivalent commands:

   ```sh
   npm ci --ignore-scripts
   npm run build
   npm run setup
   ```

3. Enter Application ID, Server ID and bot token. Token entry is hidden: press Enter to finish, Esc/Ctrl+C to cancel. No visible characters is expected. Use your terminal's paste action; never put the token in a command-line argument. An interactive terminal is required; redirected input is rejected.
4. Setup saves a local `.env` and refuses to overwrite an existing file. To reconfigure, stop the bot, move the old `.env` somewhere private, and run setup again. Avoid retaining obsolete secret copies. Never insert a real token in `.env.example`.
5. Windows: `register.cmd`. macOS/Linux: `bash register.sh`. Or `npm run register`. This creates/updates only this application's `/shiftsprig` guild command, without bulk deleting other commands. Register after setup or a command-schema change, not on every start.
6. Windows: `start.cmd`. macOS/Linux: `bash start.sh`. Or `npm start`. Wait for “ShiftSprig ready / hazır”, then test in Discord. Ctrl+C stops the bot; closing the terminal also stops it.

### Configuration

The wizard manages three values: secret `DISCORD_TOKEN`, Portal `DISCORD_APPLICATION_ID`, and target `DISCORD_GUILD_ID`. No code edits or other settings are required. A host may supply them through secret environment variables instead of `.env`. Existing process environment values take precedence over `.env`; check stale environment variables if the wrong token/server appears to be selected. IDs are checked for shape before use; the application ID is also checked against the connected bot.

### Usage

In a regular text channel, select `/shiftsprig` with `title: Park volunteers`, `start: 2026-10-15T10:00+03:00`, `shifts: 3`, `minutes: 30`, `gap: 10`, `language: en`.

In UTC+03:00 this produces 10:00–10:30, 10:40–11:10 and 11:20–11:50. Members elsewhere see the equivalent local times. Omitted gap defaults to zero. Omitted language uses Turkish for a Turkish Discord locale and English otherwise.

Review the private card. **Share** publishes the title and all slots to the same channel; **Discard** removes the preview. Controls cannot be transferred to another person/channel/message. A valid share/discard attempt consumes the preview, including when permission or network checks fail. Generate a new preview to retry. If delivery is uncertain, inspect the channel first. There are no application-level automatic resends; REST 5xx retries are disabled, while the SDK may wait to honor Discord rate limits.

For changes, create a replacement plan; a human with the appropriate permission can delete the old card. The bot does not scan, edit or delete historical messages. Buttons have text labels and information does not depend solely on color. Validate actual mobile and screen-reader usability with your community.

### Keeping the bot online

Run one persistent Node.js 24 process with the repository root as working directory. A sleeping/offline computer cannot respond to commands. For 24/7 use, select a host supporting Node 24, configure secret environment variables, use `npm ci --ignore-scripts` and `npm run build` during deployment, then `npm start` as the run command. Check whether the host sleeps idle services. Periodic GitHub Actions alone cannot keep a Gateway bot online. CI does not need your Discord token. Multiple replicas do not share cooldowns and are unsupported. Restarts discard pending previews and temporary rate records; old buttons become invalid, but published Discord cards remain.

### Security and privacy

Only submitted slash commands and button interactions are processed. Titles, dates and options reach Discord and the bot process. Private responses are delivered through Discord; “ephemeral” is not an anonymity or end-to-end-encryption guarantee. Do not submit private contact details or secrets in titles. Pending RAM drafts contain creator/guild/channel/message IDs, card language/content and expiry. Raw interaction objects are not stored in the draft store. Draft validity is at most five minutes; user/channel cooldown records last five/sixty seconds, with up to thirty seconds of pruning delay. There is no database, file history, analytics, viewer list or telemetry. SDK message/member/user caches are disabled; guild/channel connection metadata may remain in SDK memory.

Deleting RAM records does not delete Discord messages. Private responses and public cards follow Discord retention rules and can remain visible after expiry. Shutdown clears the bot's maps, without promising memory zeroization or removal from Discord. API errors use generic messages without credentials or user content. Configure host log/access policies separately.

Git ignores `.env`. Setup requests Unix mode 0600; restrict NTFS access to your account on Windows. Avoid shared/cloud-public folders. If exposed, **Reset Token** in Portal, replace local configuration and restart. See [SECURITY.md](SECURITY.md).

### Troubleshooting

- **npm/node missing:** install Node 24 LTS and reopen the terminal. If PowerShell blocks npm.ps1, use `npm.cmd` or the Windows helpers; disabling execution policy is unnecessary.
- **Missing build:** run `npm ci --ignore-scripts` and `npm run build` in the project root. Extract all files first.
- **Setup stopped:** use an interactive terminal, check numeric IDs and token. Existing `.env` is never overwritten; move it privately before reconfiguring. Never share token screenshots.
- **Registration failed / 401:** check token and Application ID; reset the bot token if needed. For 403/404, check installation and Server ID.
- **Command missing:** run registration, check the configured guild, `applications.commands` scope and command permissions, then refresh Discord.
- **Offline / no response:** check the start terminal, network and machine sleep. Interactions Endpoint URL should be empty. Restart after changing token/environment variables.
- **Permission error:** check channel overrides/category inheritance for both member and bot View Channel/Send Messages. Administrator is unnecessary.
- **Rejected/wrong time:** use uppercase `T` and `Z` or an explicit offset, omit seconds, check the calendar date and correct event offset. Verify daylight saving manually and your Discord device timezone.
- **Invalid preview:** it expired, was consumed, belongs to a different person/message, or the bot restarted. Create a new one.
- **Unconfirmed delivery:** a message may have arrived; inspect the channel before retrying. Wait when cooldown/capacity warnings ask you to.

### Tests, contributing and license

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/launch.mjs
node --check scripts/check-supply.mjs
bash -n setup.sh start.sh register.sh
```

`check` runs Biome's recommended lint/format/import rules, strict TypeScript including dependency types, explicitly named test files, and supply/credential-pattern checks. Tests cover invalid dates/leap years/offsets, elapsed durations/gaps, midnight/daylight-saving boundaries, title escaping, maximum cards, ownership/message binding, capacity, concurrent clicks, permissions/API failures and safe unconfigured startup. Discord interactions are mocked; live installation, hidden-token entry, mobile/screen-reader behavior and continuous hosting require operator validation. No live token is needed in CI. VDS testing was not used for this project's verification.

Supply checks verify allowlisted dependency license metadata, npm registry URLs, SHA-512 integrity metadata and absence of install scripts. Source scans detect common Discord/GitHub token and private-key patterns; they are not a comprehensive security audit. Known vulnerability checks run separately through `npm audit`. If `.env` exists, the source scan intentionally stops: move it privately outside the check tree or use a clean development copy. Read-only CI runs on Ubuntu, Windows and macOS, also checking Node/Bash helper syntax and clean Git diffs. Actions are pinned to commit SHAs with only `contents: read` permission.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributions. Provide minimal reproducible examples without real tokens or personal data. Code is [MIT licensed](LICENSE); dependencies retain their respective licenses. Operators must follow Discord's [Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) and terms.
