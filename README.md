# Webbanquanao

# Tài liệu Dự án: Module Thanh toán (Checkout)

## I. User Story 1: Khách hàng thanh toán đơn hàng

### User Story

Là một khách hàng đã đăng ký tài khoản, tôi muốn thanh toán đơn hàng của mình, vì thế hoàn tất việc mua hàng và nhận sản phẩm.

### Acceptance Criteria

- AC1: Hệ thống phải hiển thị thông tin đơn hàng trước khi thanh toán, bao gồm sản phẩm, số lượng và tổng tiền.
- AC2: Người dùng phải có thể xác nhận đặt hàng từ trang checkout.
- AC3: Sau khi thanh toán hoặc đặt hàng thành công, hệ thống phải tạo đơn hàng và lưu vào lịch sử mua hàng.

### Happy Path

#### Scenario 1: Thanh toán đơn hàng thành công

- Given: Người dùng đã đăng nhập.
- And: có sản phẩm trong giỏ hàng
- When: Người dùng vào trang checkout.
- And: Người dùng xem lại thông tin đơn hàng.
- And: Người dùng nhấn `Đặt hàng`.
- Then: Hệ thống tạo đơn hàng thành công.
- And: Hệ thống lưu đơn hàng vào lịch sử mua hàng.
- And: Hệ thống hiển thị thông báo đặt hàng thành công.

### Unhappy Path

#### Scenario 2: Giỏ hàng trống

- Given: Người dùng đã đăng nhập.
- When: Người dùng vào trang checkout nhưng không có sản phẩm trong giỏ.
- Then: Hệ thống hiển thị thông báo giỏ hàng trống.
- And: Hệ thống không cho phép tiếp tục thanh toán.

#### Scenario 3: Thiếu thông tin giao hàng

- Given: Người dùng đang ở trang checkout.
- When: Người dùng xác nhận đặt hàng nhưng chưa có địa chỉ hoặc thông tin nhận hàng chưa đầy đủ.
- Then: Hệ thống hiển thị thông báo yêu cầu bổ sung thông tin giao hàng.
- And: Hệ thống không xử lý đơn hàng.

## II. User Story 2: Chọn phương thức thanh toán bằng thẻ

### User Story

Là một khách hàng đã đăng ký tài khoản, tôi muốn chọn phương thức thanh toán bằng thẻ để có thể thanh toán trực tuyến nhanh chóng và tiện lợi.

### Acceptance Criteria

- AC1: Hệ thống phải hiển thị phương thức thanh toán bằng thẻ trong trang checkout.
- AC2: Người dùng phải có thể nhập và xác nhận thông tin thẻ trước khi thanh toán.
- AC3: Nếu giao dịch thành công, hệ thống phải lưu thông tin thanh toán và tạo đơn hàng.

### Happy Path

#### Scenario 1: Thanh toán bằng thẻ thành công

- Given: Người dùng đã đăng nhập.
- And: Người dùng có sản phẩm trong giỏ hàng.
- And: Sản phẩm trong giỏ còn hàng.
- When: Người dùng vào trang checkout.
- And: Người dùng chọn phương thức thanh toán bằng thẻ.
- And: Người dùng nhập thông tin thẻ hợp lệ.
- And: Người dùng nhấn `Xác nhận`.
- Then: Hệ thống xử lý giao dịch thành công.
- And: Hệ thống tạo đơn hàng.
- And: Hệ thống lưu thông tin thanh toán.
- And: Hệ thống hiển thị thông báo thanh toán thành công.

### Unhappy Path

#### Scenario 2: Thông tin thẻ không hợp lệ

- Given: Người dùng đã chọn thanh toán bằng thẻ.
- When: Người dùng nhập số thẻ hoặc thông tin thẻ không hợp lệ.
- Then: Hệ thống hiển thị thông báo lỗi thông tin thẻ.
- And: Hệ thống không tạo đơn hàng.

#### Scenario 3: Giao dịch bị từ chối

- Given: Người dùng đã nhập đầy đủ thông tin thẻ.
- When: Cổng thanh toán từ chối giao dịch.
- Then: Hệ thống hiển thị thông báo thanh toán thất bại.
- And: Hệ thống không hoàn tất đơn hàng.

#### Scenario 4: Lỗi hệ thống trong quá trình thanh toán

- Given: Người dùng đang thanh toán bằng thẻ.
- When: Xảy ra lỗi trong quá trình xử lý giao dịch.
- Then: Hệ thống rollback dữ liệu liên quan.
- And: Hệ thống hiển thị thông báo lỗi để người dùng thử lại.

#### Scenario 5: Ngày hết hạn của thẻ đã quá hạn

-Given người dùng đã đăng nhập và có sản phẩm trong giỏ hàng
-And người dùng chọn phương thức thanh toán bằng thẻ tín dụng/ghi nợ
-When người dùng nhập số thẻ hợp lệ nhưng ngày hết hạn đã qua
-Then hệ thống hiển thị thông báo lỗi “Thẻ đã hết hạn, vui lòng sử dụng thẻ khác”
-And đơn hàng không được tạo, người dùng vẫn ở trang thanh toán để chọn phương thức khác

## III. User Story 3: Lưu thông tin địa chỉ để không phải nhập lại

### User Story

Là một khách hàng đã đăng ký tài khoản, tôi muốn lưu thông tin địa chỉ giao hàng ,vì thế không cần nhập lại mỗi khi thanh toán.

#### Scenario

- Given: Người dùng đã đăng nhập và đang thực hiện thanh toán.
- When: Người dùng nhập địa chỉ giao hàng và chọn lưu thông tin này.
- Then: Hệ thống lưu địa chỉ để sử dụng lại cho các lần thanh toán sau.

### Acceptance Criteria

- AC1: Người dùng phải có thể lưu địa chỉ giao hàng trong tài khoản của mình.
- AC2: Hệ thống phải tự động hiển thị địa chỉ đã lưu ở lần thanh toán tiếp theo.
- AC3: Nếu người dùng có nhiều địa chỉ đã lưu, hệ thống phải cho phép chọn một địa chỉ phù hợp khi checkout.

### Happy Path

#### Scenario 1: Lưu địa chỉ thành công và dùng lại ở lần sau

- Given: Người dùng đã đăng nhập.
- And: Người dùng đang ở trang checkout.
- When: Người dùng nhập đầy đủ thông tin địa chỉ giao hàng.
- And: Người dùng chọn lưu địa chỉ này.
- And: Người dùng hoàn tất đơn hàng.
- Then: Hệ thống lưu địa chỉ vào tài khoản người dùng.
- And: Ở lần thanh toán tiếp theo, hệ thống tự động hiển thị địa chỉ đã lưu.
- And: Người dùng có thể chọn nhanh địa chỉ đó để tiếp tục checkout.

### Unhappy Path

#### Scenario 2: Địa chỉ nhập thiếu thông tin bắt buộc

- Given: Người dùng đang nhập địa chỉ giao hàng.
- When: Người dùng bỏ trống thông tin bắt buộc như số điện thoại, tỉnh thành hoặc địa chỉ nhận hàng.
- Then: Hệ thống hiển thị thông báo yêu cầu nhập đầy đủ địa chỉ.
- And: Hệ thống không lưu địa chỉ.

#### Scenario 3: Không tải được địa chỉ đã lưu

- Given: Người dùng đã có địa chỉ lưu trước đó.
- When: Người dùng truy cập trang checkout nhưng hệ thống không tải được danh sách địa chỉ.
- Then: Hệ thống hiển thị thông báo lỗi tải dữ liệu.
- And: Hệ thống cho phép người dùng nhập địa chỉ thủ công.

#### Scenario 4: Người dùng muốn thay đổi địa chỉ đã lưu

- Given: Người dùng đã có ít nhất một địa chỉ giao hàng.
- When: Người dùng muốn dùng một địa chỉ khác cho đơn hàng hiện tại.
- Then: Hệ thống cho phép người dùng chọn địa chỉ khác hoặc nhập địa chỉ mới.
- And: Hệ thống không bắt buộc ghi đè địa chỉ mặc định nếu người dùng không muốn.
