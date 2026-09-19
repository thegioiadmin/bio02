const fs = require('fs');

const policyArticles = [
  {
    id: 'art_dieu_khoan',
    slug: 'dieu-khoan',
    title: 'Điều Khoản Sử Dụng Dịch Vụ',
    category: 'Chính sách',
    author: 'Ban Pháp Chế TRANG CÁ NHÂN',
    summary: 'Quy định quyền lợi, nghĩa vụ và trách nhiệm pháp lý của thành viên và Ban quản lý nền tảng TRANG CÁ NHÂN theo quy định pháp luật.',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop',
    publishedAt: '2026-01-01',
    updatedAt: '2026-09-19',
    isPublished: true,
    views: 1540,
    content: `## 📜 ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ

Chào mừng bạn đến với **TRANG CÁ NHÂN** (website cung cấp nền tảng trang liên kết bio, danh thiếp điện tử và tích hợp thanh toán VietQR). Khi đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên hệ thống, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản dưới đây.

---

### 1. Nguyên Tắc Chung & Chấp Thuận Điều Khoản
- Nền tảng cung cấp công cụ trực tuyến cho phép người dùng tự khởi tạo trang liên kết thông tin cá nhân, danh thiếp điện tử, giới thiệu dự án, sản phẩm và tích hợp tiện ích nhận chuyển khoản.
- Điều khoản này có hiệu lực áp dụng đối với tất cả thành viên đăng ký và sử dụng dịch vụ trên nền tảng.
- Ban quản trị có quyền cập nhật, sửa đổi nội dung điều khoản để phù hợp với quy định pháp luật và thông báo công khai trên website.

---

### 2. Quyền Và Nghĩa Vụ Của Người Dùng
- **Đăng ký tài khoản**: Người dùng có nghĩa vụ cung cấp thông tin chính xác, trung thực khi đăng ký và tự bảo mật thông tin đăng nhập của mình.
- **Trách nhiệm về nội dung**: Bạn chịu hoàn toàn trách nhiệm pháp lý đối với mọi thông tin, hình ảnh, văn bản và liên kết do mình đưa lên trang Bio cá nhân.
- **Các hành vi nghiêm cấm**:
  - Không đăng tải nội dung vi phạm pháp luật nước CHXHCN Việt Nam, thuần phong mỹ tục hoặc xâm phạm quyền, lợi ích hợp pháp của tổ chức, cá nhân khác.
  - Nghiêm cấm tạo trang giả mạo cá nhân, tổ chức, cơ quan nhà nước nhằm mục đích lừa đảo, chiếm đoạt tài sản.
  - Không truyền bá mã độc, đường link lừa đảo (phishing), cờ bạc, cá độ hoặc các hoạt động phi pháp.
  - Tài khoản vi phạm sẽ bị khóa vĩnh viễn và chuyển giao thông tin cho cơ quan chức năng khi có yêu cầu.

---

### 3. Quyền Và Trách Nhiệm Của Ban Quản Lý Nền Tảng
- **Đảm bảo vận hành**: Duy trì hệ thống máy chủ hoạt động ổn định, an toàn và hỗ trợ kỹ thuật kịp thời cho người dùng.
- **Quyền xử lý vi phạm**: Tạm ngừng hoặc chấm dứt cung cấp dịch vụ đối với tài khoản vi phạm các quy định mà không cần bồi thường thiệt hại phát sinh từ hành vi vi phạm đó.
- **Bảo mật dữ liệu**: Thực hiện các biện pháp kỹ thuật cần thiết để bảo vệ thông tin cá nhân của người dùng theo đúng Chính sách bảo mật.

---

### 4. Quyền Sở Hữu Trí Tuệ
- Toàn bộ giao diện, thiết kế, mã nguồn, nhãn hiệu và biểu tượng **TRANG CÁ NHÂN** thuộc quyền sở hữu của Ban quản lý nền tảng.
- Người dùng giữ quyền sở hữu đối với các nội dung do mình tự khởi tạo và chia sẻ hợp pháp trên trang cá nhân.

---

### 5. Giới Hạn Trách Nhiệm Pháp Lý
- Nền tảng đóng vai trò là công cụ hiển thị thông tin do người dùng tự thiết lập. Mọi giao dịch, trao đổi kinh tế hoặc thỏa thuận giữa chủ tài khoản Bio và người truy cập bên thứ ba là quan hệ dân sự riêng của các bên, nằm ngoài trách nhiệm của Nền tảng.
- Trong trường hợp bất khả kháng (thiên tai, sự cố đường truyền mạng quốc tế, sự cố nhà cung cấp hạ tầng cấp cao), Ban quản trị sẽ nỗ lực khắc phục trong thời gian sớm nhất nhưng được miễn trừ các trách nhiệm bồi thường gián tiếp.`
  },
  {
    id: 'art_chinh_sach',
    slug: 'chinh-sach',
    title: 'Chính Sách Bảo Mật Thông Tin Cá Nhân',
    category: 'Chính sách',
    author: 'Ban Quản Trị TRANG CÁ NHÂN',
    summary: 'Quy định thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân theo Điều 68-73 Nghị định 52/2013/NĐ-CP và Nghị định 13/2023/NĐ-CP.',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    publishedAt: '2026-01-01',
    updatedAt: '2026-09-19',
    isPublished: true,
    views: 1820,
    content: `## 🛡️ CHÍNH SÁCH BẢO MẬT THÔNG TIN CÁ NHÂN

Chính sách bảo mật này được lập nhằm tuân thủ quy định tại **Điều 68 đến Điều 73 Nghị định số 52/2013/NĐ-CP**, Nghị định số 85/2021/NĐ-CP và Nghị định số 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân trong hoạt động thương mại điện tử.

---

### 1. Mục Đích Thu Thập Thông Tin Cá Nhân
Chúng tôi thu thập thông tin cá nhân của người dùng nhằm:
- Cung cấp, duy trì và nâng cao chất lượng dịch vụ tạo trang Bio cá nhân và danh thiếp điện tử.
- Xác thực tài khoản, thực hiện các giao dịch nâng cấp gói dịch vụ (PRO, VIP) và nạp ví số dư.
- Gửi thông báo quan trọng về hệ thống, bảo mật tài khoản hoặc thay đổi chính sách dịch vụ.
- Hỗ trợ kỹ thuật, giải đáp thắc mắc và xử lý khiếu nại của người dùng.

---

### 2. Phạm Vi Thu Thập Thông Tin
- **Thông tin cơ bản**: Họ tên, Địa chỉ Email, Số điện thoại (dùng để đăng ký và khôi phục mật khẩu).
- **Thông tin trang Bio công khai**: Ảnh đại diện, tiểu sử, các đường liên kết mạng xã hội, thông tin liên hệ và số tài khoản ngân hàng nhận tiền mà người dùng chủ động công khai.
- **Dữ liệu kỹ thuật**: Địa chỉ IP, loại trình duyệt, hệ điều hành và số lượt tương tác ẩn danh phục vụ tính năng thống kê (Analytics) cho chủ tài khoản.

---

### 3. Phạm Vi Sử Dụng Thông Tin
- Thông tin thu thập chỉ được sử dụng trong phạm vi nội bộ nền tảng **TRANG CÁ NHÂN** để phục vụ các mục đích nêu tại Mục 1.
- **Cam kết**: Chúng tôi **tuyệt đối KHÔNG bán, chuyển nhượng hoặc chia sẻ** thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại.
- Thông tin chỉ được cung cấp cho cơ quan nhà nước có thẩm quyền khi có văn bản yêu cầu chính thức theo quy định của pháp luật Việt Nam.

---

### 4. Thời Gian Lưu Trữ Thông Tin
- Dữ liệu cá nhân của người dùng sẽ được lưu trữ an toàn trên hệ thống máy chủ trong suốt thời gian tài khoản hoạt động.
- Dữ liệu sẽ được hủy bỏ hoặc xóa vĩnh viễn khi người dùng thực hiện thao tác xóa tài khoản hoặc gửi yêu cầu bằng văn bản/email tới Ban quản lý.

---

### 5. Những Người Hoặc Tổ Chức Có Thể Tiếp Cận Thông Tin
- Đội ngũ kỹ thuật viên và bộ phận hỗ trợ khách hàng được ủy quyền của **TRANG CÁ NHÂN** (chỉ tiếp cận trong phạm vi xử lý sự cố hoặc hỗ trợ người dùng).
- Cơ quan nhà nước có thẩm quyền theo quy định pháp luật.

---

### 6. Địa Chỉ Của Đơn Vị Thu Thập Và Quản Lý Thông Tin
- **Đơn vị chủ quản**: Nền tảng TRANG CÁ NHÂN
- **Email hỗ trợ & tiếp nhận bảo mật**: thegioiadmin@gmail.com / contact@trangcanhan.com
- **Hotline**: 0988 888 999 (8h00 - 21h00 hàng ngày)
- **Địa chỉ liên hệ**: Tầng 6, Tòa nhà Công Nghệ Số, TP. Hồ Chí Minh, Việt Nam.

---

### 7. Phương Tiện Và Công Cụ Để Người Dùng Chỉnh Sửa Dữ Liệu Cá Nhân
- Người dùng có thể tự do đăng nhập vào hệ thống bất kỳ lúc nào để xem, chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân và thông tin trang Bio tại mục **Cài Đặt Hồ Sơ**.
- Trường hợp cần hỗ trợ xóa tài khoản hoàn toàn, người dùng có thể gửi email yêu cầu về địa chỉ **thegioiadmin@gmail.com** để được xử lý trong vòng 24 giờ.

---

### 8. Cam Kết Bảo Mật & Tiếp Nhận Khiếu Nại Về Thông Tin Cá Nhân
- Hệ thống áp dụng công nghệ mã hóa kết nối bảo mật SSL/TLS 256-bit, tường lửa bảo vệ máy chủ và sao lưu định kỳ.
- Mọi khiếu nại liên quan đến việc thông tin cá nhân bị sử dụng sai mục đích hoặc phạm vi đã thông báo sẽ được tiếp nhận và xử lý nhanh chóng trong vòng 48 giờ làm việc qua Email hoặc Hotline của Ban quản lý.`
  },
  {
    id: 'art_chinh_sach_thanh_toan',
    slug: 'chinh-sach-thanh-toan',
    title: 'Chính Sách Thanh Toán & Hoàn Tiền',
    category: 'Chính sách',
    author: 'Phòng Tài Chính TRANG CÁ NHÂN',
    summary: 'Quy định về phương thức thanh toán trực tuyến qua VietQR, quy trình kích hoạt gói dịch vụ và chính sách hoàn tiền minh bạch trong 07 ngày.',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
    publishedAt: '2026-01-01',
    updatedAt: '2026-09-19',
    isPublished: true,
    views: 980,
    content: `## 💳 CHÍNH SÁCH THANH TOÁN & HOÀN TIỀN

Nhằm đảm bảo quyền lợi tối đa và sự minh bạch cho khách hàng khi sử dụng các dịch vụ có thu phí (nâng cấp gói PRO, VIP, gắn tên miền riêng) tại **TRANG CÁ NHÂN**, chúng tôi công bố chính sách thanh toán và hoàn tiền cụ thể như sau:

---

### 1. Phương Thức Thanh Toán Chấp Nhận
- **Chuyển khoản ngân hàng trực tuyến 24/7 (VietQR)**: Quét mã QR tự động chuẩn NAPAS247 thông qua ứng dụng ngân hàng di động (Mobile Banking) hoặc ví điện tử. Nội dung chuyển khoản được tạo tự động để hệ thống ghi nhận chính xác tức thì.
- **Thanh toán bằng số dư ví tài khoản**: Sử dụng tiền đã nạp trong ví hệ thống để kích hoạt hoặc gia hạn gói dịch vụ.
- **Tính an toàn**: Tất cả thông tin giao dịch đều được mã hóa và xác thực trực tiếp qua hệ thống ngân hàng đối tác, không lưu trữ thông tin thẻ tín dụng/mật khẩu ngân hàng của khách hàng trên máy chủ.

---

### 2. Quy Trình Kích Hoạt Dịch Vụ
- Sau khi khách hàng thực hiện chuyển khoản thành công với đúng nội dung mã giao dịch được cấp, hệ thống tự động xác nhận và **kích hoạt tính năng gói cước ngay lập tức (trong vòng 1 - 3 phút)**.
- Khách hàng nhận được thông báo xác nhận nâng cấp thành công trên màn hình và qua email đăng ký tài khoản.
- Trường hợp chuyển khoản nhưng sau 15 phút chưa được kích hoạt do sai cú pháp, vui lòng liên hệ Hotline **0988 888 999** kèm ảnh chụp biên lai giao dịch để được hỗ trợ kích hoạt thủ công nhanh nhất.

---

### 3. Quy Định Về Bảng Giá Và Hóa Đơn
- Bảng giá các gói dịch vụ (Free, PRO, VIP) được niêm yết công khai tại mục **Bảng Giá** trên website.
- Giá dịch vụ đã bao gồm toàn bộ các tính năng tương ứng của từng gói, cam kết không phát sinh phụ phí ẩn trong suốt thời hạn sử dụng.

---

### 4. Chính Sách Hoàn Tiền (Refund Policy)
Chúng tôi cam kết chính sách hoàn tiền công bằng, minh bạch trong các trường hợp sau:
- **Thời hạn áp dụng**: Trong vòng **07 ngày** kể từ thời điểm giao dịch thanh toán nâng cấp gói thành công.
- **Điều kiện được hoàn tiền 100%**:
  - Dịch vụ phát sinh lỗi kỹ thuật nghiêm trọng từ phía hệ thống **TRANG CÁ NHÂN** dẫn đến khách hàng không thể sử dụng các tính năng cam kết của gói PRO/VIP và đội ngũ kỹ thuật không thể khắc phục trong vòng 48 giờ.
  - Khách hàng vô tình chuyển khoản trùng lặp nhiều lần cho cùng một gói dịch vụ.
- **Trường hợp không áp dụng hoàn tiền**:
  - Yêu cầu hoàn tiền gửi sau thời hạn 07 ngày kể từ ngày nâng cấp.
  - Tài khoản bị khóa hoặc tạm dừng do vi phạm nghiêm trọng Điều khoản sử dụng (đăng tải nội dung lừa đảo, cờ bạc, vi phạm pháp luật).
  - Khách hàng đổi ý không muốn sử dụng tiếp trong khi hệ thống vẫn đang hoạt động ổn định và bình thường.

---

### 5. Thời Gian & Phương Thức Hoàn Tiền
- **Phương thức hoàn tiền**: Chuyển khoản trực tiếp về số tài khoản ngân hàng chính chủ của khách hàng đã sử dụng để thanh toán.
- **Thời hạn xử lý**: Trong vòng **03 đến 05 ngày làm việc** kể từ thời điểm bộ phận chăm sóc khách hàng xác nhận yêu cầu hoàn tiền hợp lệ.
- **Kênh tiếp nhận yêu cầu hoàn tiền**: Gửi email về **thegioiadmin@gmail.com** hoặc gọi Hotline **0988 888 999** với tiêu đề: *Yêu cầu hoàn tiền - [Tên tài khoản / Mã giao dịch]*.`
  },
  {
    id: 'art_giai_quyet_khieu_nai',
    slug: 'giai-quyet-khieu-nai',
    title: 'Quy Trình Tiếp Nhận & Giải Quyết Khiếu Nại',
    category: 'Chính sách',
    author: 'Trung Tâm Chăm Sóc Khách Hàng',
    summary: 'Cơ chế tiếp nhận, thời hạn xác minh và quy trình giải quyết khiếu nại, tranh chấp phát sinh giữa người dùng và nền tảng theo quy định của pháp luật.',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
    publishedAt: '2026-01-01',
    updatedAt: '2026-09-19',
    isPublished: true,
    views: 850,
    content: `## ⚖️ QUY TRÌNH TIẾP NHẬN & GIẢI QUYẾT KHIẾU NẠI

**TRANG CÁ NHÂN** luôn coi trọng quyền lợi chính đáng của người sử dụng dịch vụ và khách hàng. Chúng tôi thiết lập quy trình tiếp nhận và giải quyết khiếu nại minh bạch, nhanh chóng và công bằng theo đúng quy định pháp luật thương mại điện tử Việt Nam.

---

### 1. Nguyên Tắc Giải Quyết Khiếu Nại & Tranh Chấp
- Mọi khiếu nại của người dùng đều được tiếp nhận và xử lý với tinh thần cầu thị, lắng nghe và tôn trọng.
- Ưu tiên phương thức **thương lượng, đối thoại và hòa giải** giữa các bên để đạt được sự đồng thuận tốt nhất.
- Trường hợp khiếu nại liên quan đến quyền lợi tài chính, thời gian kích hoạt gói hoặc an toàn dữ liệu, hệ thống cam kết xử lý ưu tiên khẩn cấp.

---

### 2. Các Kênh Tiếp Nhận Khiếu Nại Chính Thức
Người dùng có thể gửi khiếu nại qua một trong các kênh liên hệ sau:
- **Email tiếp nhận chuyên trách**: thegioiadmin@gmail.com / contact@trangcanhan.com
- **Đường dây nóng (Hotline)**: 0988 888 999 (Hoạt động từ 8h00 đến 21h00 hàng ngày)
- **Gửi phiếu hỗ trợ (Ticket)**: Trực tiếp tại mục Hỗ Trợ trong giao diện quản trị tài khoản người dùng.
- **Địa chỉ văn phòng**: Tầng 6, Tòa nhà Công Nghệ Số, TP. Hồ Chí Minh, Việt Nam.

---

### 3. Quy Trình 4 Bước Xử Lý Khiếu Nại
- **Bước 1: Tiếp nhận thông tin (Trong vòng 24 giờ làm việc)**
  Bộ phận Chăm sóc Khách hàng tiếp nhận khiếu nại, xác minh danh tính người gửi và phản hồi xác nhận đã nhận thông tin qua Email hoặc Tin nhắn SMS/Zalo.
- **Bước 2: Xác minh & Thẩm định (Trong vòng 24 - 48 giờ làm việc)**
  Bộ phận chuyên trách phối hợp cùng Kỹ thuật/Tài chính kiểm tra lịch sử thao tác hệ thống, dữ liệu nhật ký máy chủ và đối chiếu các bằng chứng liên quan.
- **Bước 3: Đưa ra giải pháp & Phản hồi (Tối đa 03 ngày làm việc)**
  Gửi văn bản/email phản hồi chính thức cho khách hàng, nêu rõ nguyên nhân và phương án giải quyết (khắc phục kỹ thuật, gia hạn thời gian sử dụng dịch vụ hoặc hoàn tiền theo Chính sách thanh toán).
- **Bước 4: Hoàn tất & Đóng hồ sơ**
  Thực hiện biện pháp khắc phục đã thỏa thuận và ghi nhận đánh giá hài lòng của khách hàng để cải tiến chất lượng hệ thống.

---

### 4. Cơ Chế Xử Lý Tranh Chấp Phát Sinh
- Trong trường hợp bất đồng ý kiến không thể giải quyết thông qua thương lượng hoặc hòa giải, một trong hai bên có quyền đưa vụ việc ra Tòa án nhân dân có thẩm quyền tại Việt Nam để giải quyết theo quy định của pháp luật.
- Phán quyết của Tòa án là quyết định cuối cùng và có hiệu lực thi hành bắt buộc đối với cả hai bên.`
  },
  {
    id: 'art_quy_che_hoat_dong',
    slug: 'quy-che-hoat-dong',
    title: 'Quy Chế Hoạt Động Nền Tảng',
    category: 'Chính sách',
    author: 'Ban Quản Trị TRANG CÁ NHÂN',
    summary: 'Quy chế quản lý, vận hành và cung cấp dịch vụ trực tuyến tại TRANG CÁ NHÂN, đáp ứng quy chuẩn thông báo website với Bộ Công Thương.',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    publishedAt: '2026-01-01',
    updatedAt: '2026-09-19',
    isPublished: true,
    views: 920,
    content: `## 📋 QUY CHẾ HOẠT ĐỘNG NỀN TẢNG

Quy chế hoạt động này quy định các nguyên tắc, quyền hạn và trách nhiệm trong việc quản lý, vận hành và cung ứng dịch vụ trực tuyến trên website **TRANG CÁ NHÂN**, phục vụ cho việc thông báo hoạt động website cung cấp dịch vụ thương mại điện tử với Bộ Công Thương Việt Nam.

---

### 1. Nguyên Tắc Hoạt Động Chung
- Nền tảng **TRANG CÁ NHÂN** hoạt động tuân thủ nghiêm túc các quy định của pháp luật Việt Nam về thương mại điện tử, an toàn thông tin mạng và bảo vệ quyền lợi người tiêu dùng.
- Hoạt động cung cấp dịch vụ được thực hiện công khai, minh bạch, bảo đảm quyền lợi chính đáng của mọi thành viên tham gia.
- Mọi cá nhân, tổ chức đều có quyền đăng ký tài khoản và sử dụng các tính năng miễn phí hoặc trả phí theo đúng quy chế này.

---

### 2. Quy Trình Cung Cấp & Sử Dụng Dịch Vụ
- **Bước 1: Đăng ký tài khoản**
  Người dùng điền thông tin email, mật khẩu để khởi tạo tài khoản miễn phí trên hệ thống.
- **Bước 2: Thiết lập trang Bio liên kết**
  Thành viên tự do tùy chỉnh giao diện, thêm các liên kết mạng xã hội, thẻ danh bạ vCard, mã VietQR nhận tiền, hình ảnh và nội dung giới thiệu cá nhân.
- **Bước 3: Lựa chọn gói dịch vụ**
  Người dùng có thể duy trì sử dụng gói Miễn phí (Free) hoặc nâng cấp lên các gói nâng cao (PRO, VIP) để mở rộng tính năng và gắn tên miền riêng.
- **Bước 4: Xuất bản và chia sẻ**
  Hệ thống cấp phát đường dẫn trực tuyến duy nhất dạng trangcanhan.com/username để thành viên gắn lên các nền tảng mạng xã hội hoặc in trên danh thiếp.

---

### 3. Cơ Chế Kiểm Soát Nội Dung & Phòng Chống Gian Lận
- Hệ thống áp dụng công cụ lọc tự động và đội ngũ kiểm duyệt viên định kỳ rà soát các trang Bio được xuất bản công khai.
- **Biện pháp xử lý**: Ngay khi phát hiện trang cá nhân chứa nội dung độc hại, lừa đảo, cờ bạc, vi phạm bản quyền hoặc nhận được phản ánh hợp lệ từ cơ quan chức năng, Ban quản trị sẽ tiến hành tạm khóa hoặc xóa vĩnh viễn trang vi phạm trong vòng 04 giờ.

---

### 4. An Toàn Thông Tin & Lưu Trữ Dữ Liệu
- Hệ thống lưu trữ dữ liệu trên nền tảng đám mây đạt tiêu chuẩn bảo mật cao, có cơ chế sao lưu tự động hàng ngày để phòng ngừa rủi ro mất mát dữ liệu.
- Mọi thông tin cá nhân và dữ liệu cấu hình của người dùng được bảo mật tuyệt đối theo Chính sách bảo mật thông tin đã công bố.

---

### 5. Hiệu Lực Và Sửa Đổi Quy Chế
- Quy chế này có hiệu lực kể từ ngày được đăng tải chính thức trên website **TRANG CÁ NHÂN**.
- Ban quản lý có quyền sửa đổi, bổ sung quy chế để đáp ứng các yêu cầu quản lý thực tế và quy định pháp luật mới của Nhà nước. Nội dung sửa đổi sẽ được thông báo trước ít nhất 05 ngày trên website trước khi áp dụng.`
  }
];

// Define standard Footer Columns strictly compliant with Vietnam Ministry of Industry and Trade:
const standardFooterColumns = [
  {
    id: "col_products",
    title: "SẢN PHẨM",
    links: [
      { id: "p1", label: "Tính năng nổi bật", url: "#features-section" },
      { id: "p2", label: "Kho mẫu giao diện", url: "#templates-showcase" },
      { id: "p3", label: "Bảng giá dịch vụ", url: "#pricing-section" },
      { id: "p4", label: "Tên miền riêng", url: "#domains-section" }
    ]
  },
  {
    id: "col_policies",
    title: "CHÍNH SÁCH",
    links: [
      { id: "pol_1", label: "Điều khoản sử dụng", url: "/dieu-khoan", articleSlug: "dieu-khoan" },
      { id: "pol_2", label: "Chính sách bảo mật", url: "/chinh-sach", articleSlug: "chinh-sach" },
      { id: "pol_3", label: "Thanh toán & Hoàn tiền", url: "/chinh-sach-thanh-toan", articleSlug: "chinh-sach-thanh-toan" },
      { id: "pol_4", label: "Giải quyết khiếu nại", url: "/giai-quyet-khieu-nai", articleSlug: "giai-quyet-khieu-nai" },
      { id: "pol_5", label: "Quy chế hoạt động", url: "/quy-che-hoat-dong", articleSlug: "quy-che-hoat-dong" }
    ]
  },
  {
    id: "col_company",
    title: "CÔNG TY",
    links: [
      { id: "c1", label: "Về chúng tôi", url: "/gioi-thieu", articleSlug: "gioi-thieu" },
      { id: "c2", label: "Hướng dẫn sử dụng", url: "/huong-dan-tong-quan-a-den-z", articleSlug: "huong-dan-tong-quan-a-den-z" },
      { id: "c3", label: "FAQ (Hỏi & Đáp)", url: "#faq" },
      { id: "c4", label: "Liên hệ hỗ trợ", url: "/lien-he", articleSlug: "lien-he" }
    ]
  }
];

// 1. Update data/db.json
if (fs.existsSync('data/db.json')) {
  const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
  
  if (!db.systemConfig) db.systemConfig = {};
  
  // Merge or update articles
  let currentArticles = db.systemConfig.articles || [];
  
  // Update or insert each policy article
  for (const pol of policyArticles) {
    const idx = currentArticles.findIndex(a => a.id === pol.id || a.slug === pol.slug);
    if (idx >= 0) {
      currentArticles[idx] = { ...currentArticles[idx], ...pol };
    } else {
      currentArticles.push(pol);
    }
  }
  
  db.systemConfig.articles = currentArticles;
  db.articles = currentArticles;
  
  // Update footerConfig
  if (!db.systemConfig.footerConfig) {
    db.systemConfig.footerConfig = {};
  }
  
  db.systemConfig.footerConfig.columns = standardFooterColumns;
  
  fs.writeFileSync('data/db.json', JSON.stringify(db, null, 2), 'utf8');
  console.log('Successfully updated data/db.json with all 5 policies and standard footer columns!');
}

module.exports = { policyArticles, standardFooterColumns };
