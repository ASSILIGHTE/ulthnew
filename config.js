/**
 * =================================================================
 * A LITTLE BIRTHDAY SURPRISE - KONFIGURASI BINGKAI LUCU & ROMANTIS
 * =================================================================
 */

window.birthdayConfig = {
    // Nama penerima ucapan
    name: "Sayang",
    
    // Tanggal target ulang tahun (24 Oktober 2026)
    targetDate: "2026-10-24T00:00:00",

    // Nama pengirim
    sender: "Orang yang Selalu Mencintaimu",
    
    // File lagu & cover
    song: {
        title: "Lagu Spesial Untukmu ♡",
        artist: "Melodi Indah Kita",
        src: "music.mp3",
        cover: "photos/photo1.jpg"
    },
    
    // Pesan surat ulang tahun romantis (efek ketikan / typewriter)
    birthdayMessage: `Di hari ulang tahunmu yang spesial ini, aku hanya ingin mengingatkanmu betapa berharganya kehadiranmu di dalam hidupku. Kamu adalah kehangatan lembut yang selalu menerangi hariku, bahkan di saat-saat paling sederhana.

Ada sesuatu dari dirimu yang selalu meninggalkan jejak kebahagiaan di mana pun kamu berada. Terima kasih sudah menjadi orang yang begitu luar biasa dan penuh kasih.

Hari ini, aku berdoa agar setiap langkahmu dipeluk oleh kebahagiaan, kedamaian, dan senyuman manis yang tak pernah pudar. Semoga semua impian indahmu bermekaran satu per satu.`,

    // Galeri Foto Kenangan Menggunakan Foto di Folder photos/ & public/photos/
    photos: [
        {
            url: "photos/photo1.jpg",
            caption: "Momen kecil yang selalu kukenang ♡",
            date: "Kenangan Manis",
            detail: "Setiap detik bersamamu selalu terasa begitu hangat dan berarti. Terima kasih telah menjadi bagian terbaik di setiap hariku."
        },
        {
            url: "photos/photo2.jpg",
            caption: "Senyummu adalah alasan bahagiaku ✨",
            date: "Hari yang Indah",
            detail: "Melihat kembali foto ini selalu membuatku tersenum. Tawa dan senyumanmu adalah tempat terfavoritku di dunia."
        },
        {
            url: "photos/photo3.jpg",
            caption: "Obrolan hangat & hari yang tenang ☕",
            date: "Momen Sederhana",
            detail: "Hal paling membahagiakan bukanlah tempat yang mewah, melainkan kebersamaan dan cerita sederhana yang kita bagi."
        },
        {
            url: "photos/photo4.jpg",
            caption: "Di bawah pendar cahaya indah 🌟",
            date: "Tak Terlupakan",
            detail: "Kamu selalu menjadi sinar indah yang menghangatkan suasana di mana pun kamu berada."
        },
        {
            url: "photos/photo5.jpg",
            caption: "Selalu bersyukur memiliki kamu 🤍",
            date: "Hari Spesial",
            detail: "Di usiamu yang baru ini, semoga hatimu selalu dipenuhi dengan kebahagiaan dan rasa damai yang tak terbatas."
        }
    ],

    // Foto utama yang muncul pada Kejutan Akhir
    surprisePhoto: "photos/photo1.jpg",

    // Pesan khusus pada ucapan kejutan akhir
    finalSurpriseText: "Semoga di hari yang indah ini, hatimu selalu dipenuhi kebahagiaan, kedamaian, dan senyuman manis yang tak pernah pudar. Selamat ulang tahun ya, sayangku! ♡"
};

// Also declare var for backward compatibility
var birthdayConfig = window.birthdayConfig;
