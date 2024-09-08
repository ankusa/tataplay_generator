// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fetch from "cross-fetch";

const getUserChanDetails = async () => {
    let hmacValue;
    let obj = { list: [] };

    try {
        const responseHmac = await fetch("https://clearkeys.vercel.app/tataplay/hmac.json");
        const data = await responseHmac.json();

        // Validate structure and access values correctly
        if (data && data.data && data.data.hdntl) {
            hmacValue = data.data.hdntl.value; // Correct access to HMAC value
        } else {
            console.error("Invalid HMAC data structure");
            return obj;
        }
    } catch (error) {
        console.error('Error fetching and rearranging HMAC data:', error);
        return obj;
    }

    try {
        const responseChannels = await fetch("https://clearkeys.vercel.app/tataplay/fetcher.json");
        const cData = await responseChannels.json();

        // Validate and access channel data properly
        if (cData && cData.data && Array.isArray(cData.data)) {
            const flatChannels = cData.data.flat();
            flatChannels.forEach(channel => {
                // Check fields and handle missing data
                let clearkeyValue = channel.clearkeys_base64 || 
                                    (channel.licence1 && channel.licence2 ? `${channel.licence1}:${channel.licence2}` : null);
                
                let rearrangedChannel = {
                    id: channel.id || "",
                    name: channel.title || "Unknown Channel",
                    tvg_id: channel.id || "",
                    group_title: channel.genre || "Uncategorized",
                    tvg_logo: channel.logo || "",
                    stream_url: channel.initialUrl || "",
                    license_url: channel.license_url || "",
                    stream_headers: channel.manifest_headers ? (channel.manifest_headers['User-Agent'] || JSON.stringify(channel.manifest_headers)) : null,
                    drm: channel.drm,
                    is_mpd: channel.is_mpd,
                    kid_in_mpd: channel.kid_in_mpd,
                    hmac_required: channel.hmac_required,
                    key_extracted: channel.key_extracted,
                    pssh: channel.pssh,
                    clearkey: clearkeyValue,
                    hma: hmacValue
                };
                obj.list.push(rearrangedChannel);
            });
        } else {
            console.error('Invalid channel data structure');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return obj;
    }

    return obj;
};

const generateM3u = async (ud) => {
    let m3uStr = '';

    let userChanDetails = await getUserChanDetails();
    let chansList = userChanDetails.list;

    // Define the desired category order
    const categoryOrder = [
        "entertainment", "movies", "kids", "sports", "infotainment",
        "news", "devotional", "educational", "music"
    ];

    // Sort channels by the desired category order
    chansList.sort((a, b) => {
        const categoryA = categoryOrder.indexOf(a.group_title.toLowerCase());
        const categoryB = categoryOrder.indexOf(b.group_title.toLowerCase());
        return (categoryA === -1 ? categoryOrder.length : categoryA) - (categoryB === -1 ? categoryOrder.length : categoryB);
    });

    m3uStr = '#EXTM3U x-tvg-url="https://raw.githubusercontent.com/mitthu786/tvepg/main/tataplay/epg.xml.gz"\n\n';

    chansList.forEach(channel => {
        m3uStr += `#EXTINF:-1 tvg-id="${channel.id}" group-title="${channel.group_title}", tvg-logo="https://mediaready.videoready.tv/tatasky-epg/image/fetch/f_auto,fl_lossy,q_auto,h_250,w_250/${channel.tvg_logo}", ${channel.name}\n`;
        m3uStr += '#KODIPROP:inputstream.adaptive.license_type=clearkey\n';
        m3uStr += `#KODIPROP:inputstream.adaptive.license_key=${channel.clearkey}\n`;
        m3uStr += '#EXTVLCOPT:http-user-agent=Mozilla/5.0\n';
        m3uStr += `#EXTHTTP:{"cookie":"${channel.hma}"}\n`;
        m3uStr += `${channel.stream_url}|cookie:${channel.hma}\n\n`;
    });

    console.log('all done!');
    return m3uStr;
};

export default async function handler(req, res) {
    let uData = {
        tsActive: true
    };

    if (uData.tsActive) {
        let m3uString = await generateM3u(uData);
        res.status(200).send(m3uString);
    } else {
        res.status(400).send("TS is not active");
    }
}
