import { getJson } from "serpapi";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Danh sách 40 từ khóa
const keywords = [
  // 📰 Xã hội & Thời sự
  "báo", "chính trị", "xã hội", "giáo dục", "y tế", "pháp luật", "môi trường", "giao thông",
  "an ninh", "ngoại giao", "kinh tế", "văn hóa", "thời sự", "đời sống", "lao động", "phúc lợi",
  "chính sách", "bầu cử", "quốc hội", "biển đảo", "nông thôn", "thành phố thông minh", "chống tham nhũng", "phát triển bền vững",
  "việc làm", "bình đẳng giới", "quyền con người",

  // ⚽ Thể thao
  "bóng đá", "bóng rổ", "thể hình", "cầu lông", "chạy bộ", "bơi lội", "võ thuật", "tennis",
  "đua xe", "cờ vua", "eSports", "huấn luyện viên", "Olympic", "bóng chuyền", "bắn cung", "karatedo",
  "thể dục dụng cụ", "thể thao học đường", "giải vô địch quốc gia", "bóng bàn", "bóng chày", "thể thao nữ", "thể thao quốc tế", "thể thao phong trào",

  // 💼 Kinh doanh & Tài chính
  "bất động sản", "chứng khoán", "thương mại điện tử", "ngân hàng", "tài chính", "đầu tư", "khởi nghiệp", "marketing",
  "xuất nhập khẩu", "quản trị doanh nghiệp", "bán lẻ", "chuỗi cung ứng", "thương hiệu", "phân tích thị trường", "doanh nhân", "kế toán",
  "kinh tế số", "đổi mới sáng tạo", "logistics", "thị trường lao động", "thị trường vàng", "ngoại tệ", "ngân hàng số", "bảo hiểm nhân thọ",

  // 💻 Công nghệ & Khoa học
  "trí tuệ nhân tạo", "blockchain", "điện toán đám mây", "phần mềm mã nguồn mở", "lập trình web", "khoa học dữ liệu", "robot", "năng lượng tái tạo",
  "an ninh mạng", "máy học", "phân tích dữ liệu", "công nghệ sinh học", "điện tử", "viễn thông", "Internet vạn vật", "thực tế ảo",
  "chip bán dẫn", "5G", "tự động hóa", "máy tính lượng tử", "phát triển phần mềm", "thị giác máy tính", "công nghệ tài chính", "điện toán biên",

  // 🌍 Du lịch & Văn hóa
  "du lịch", "ẩm thực", "phim ảnh", "âm nhạc", "thời trang", "giáo dục trẻ em", "sức khỏe tinh thần", "nông nghiệp thông minh",
  "mỹ phẩm", "thể dục", "gia đình", "văn học", "nội thất", "kiến trúc", "thiết kế", "ẩm thực đường phố",
  "điểm du lịch", "đặc sản", "văn hóa dân gian", "nghệ thuật truyền thống", "du lịch sinh thái", "di sản văn hóa", "nghệ sĩ", "lễ hội Việt Nam",

  // 🌱 Môi trường & Nông nghiệp
  "biến đổi khí hậu", "năng lượng xanh", "rác thải nhựa", "tái chế", "bảo vệ động vật", "nông nghiệp hữu cơ", "lâm nghiệp", "đất hiếm",
  "nước sạch", "ô nhiễm không khí", "tài nguyên thiên nhiên", "thủy sản", "trồng rừng", "nông nghiệp bền vững", "canh tác thông minh", "nông sản Việt Nam",

  // 💬 Truyền thông & Xã hội số
  "mạng xã hội", "truyền thông", "báo điện tử", "podcast", "video ngắn", "nội dung số", "quảng cáo trực tuyến", "sản xuất nội dung",
  "tương tác người dùng", "influencer", "xây dựng thương hiệu cá nhân", "truyền hình", "phát thanh", "báo chí số", "xu hướng mạng", "tin giả",

  // 🎓 Giáo dục & Nhân sự
  "học trực tuyến", "du học", "kỹ năng mềm", "phát triển bản thân", "tuyển dụng", "nhân sự", "đào tạo nghề", "học bổng",
  "nghiên cứu khoa học", "trường đại học", "giáo viên", "giảng viên", "công nghệ giáo dục", "giáo trình số", "kỳ thi quốc gia", "phát triển kỹ năng số",

  // ❤️ Sức khỏe & Đời sống
  "dinh dưỡng", "bệnh tiểu đường", "huyết áp", "chăm sóc sức khỏe", "thiền", "y học cổ truyền", "tâm lý học", "sức khỏe sinh sản",
  "bác sĩ gia đình", "thực phẩm chức năng", "chế độ ăn uống", "phòng chống dịch", "giấc ngủ", "thể dục buổi sáng", "bảo hiểm y tế", "bệnh viện công",

  // 🏠 Xây dựng & Giao thông
  "hạ tầng", "xây dựng dân dụng", "cầu đường", "giao thông công cộng", "quy hoạch đô thị", "nhà ở xã hội", "kiến trúc xanh", "giao thông thông minh",
  "vật liệu xây dựng", "cơ khí", "xây dựng bền vững", "quản lý đô thị", "thiết kế cầu đường", "an toàn giao thông"
];


// 🔑 API key SerpAPI
const API_KEY = process.env.SERP_API_KEY;

console.log("API_KEY", API_KEY);
async function main() {
  const allUrls = new Set();
  const MAX_URLS = 1000;

  for (const keyword of keywords) {
    // Stop if we already have enough URLs
    if (allUrls.size >= MAX_URLS) {
      console.log(`🛑 Reached maximum of ${MAX_URLS} URLs. Stopping search.`);
      break;
    }

    console.log(`🔍 Searching: ${keyword}`);

    try {
      const data = await getJson({
        engine: "google",
        q: keyword,
        num: 100,
        hl: "vi",
        api_key: API_KEY,
      });

      const urls = (data.organic_results || [])
        .map(r => r.link)
        .filter(Boolean);

      // Only add URLs until we reach the limit
      for (const url of urls) {
        if (allUrls.size >= MAX_URLS) {
          break;
        }
        allUrls.add(url);
      }

      console.log(`✅ Found ${urls.length} URLs for "${keyword}" (Total: ${allUrls.size})`);
    } catch (err) {
      console.error(`❌ Error searching "${keyword}":`, err.message);
    }

  }

  const result = {
    totalUrls: allUrls.size,
    urls: Array.from(allUrls),
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("data-test.json", JSON.stringify(result, null, 2));
  console.log(`\n✅ Done. Saved ${result.totalUrls} URLs to results.json`);
}

main();