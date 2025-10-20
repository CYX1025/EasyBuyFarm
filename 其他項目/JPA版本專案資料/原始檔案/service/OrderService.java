package service;

import dao.OrderDAO;
import entity.Order;
import entity.OrderDetail;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 訂單服務（串接 OrderDAO）
 * - 依日期區間查詢（只比年月日）
 * - 查詢單筆訂單（含明細）
 * - 查詢單筆訂單的明細
 * - 建立訂單 + 明細
 *
 * 路徑範例：
 * GET  /api/orders?start=2025-10-01&end=2025-10-08
 * GET  /api/orders/ORD-20251008-123456
 * GET  /api/orders/ORD-20251008-123456/details
 * POST /api/orders
 */
@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
public class OrderService {

    private final OrderDAO orderDAO = new OrderDAO();

    /* -----------------------------
     * 依日期區間查詢（只比 年-月-日）
     * ----------------------------- */
    @GET
    @Path("/range")
    public Response getOrdersByRange(@QueryParam("start") String start,
                                     @QueryParam("end") String end) {
        try {
            if (isBlank(start) || isBlank(end)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(error("請提供 start 與 end（格式：yyyy-MM-dd）"))
                        .build();
            }
            if (!isValidYmd(start) || !isValidYmd(end)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(error("日期格式錯誤，需為 yyyy-MM-dd"))
                        .build();
            }

            List<Order> list = orderDAO.findByDateRange(start, end);
            return Response.ok(list).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(error("查詢失敗：" + e.getMessage())).build();
        }
    }

    /* -----------------------------
     * 查單筆訂單（含明細）
     * ----------------------------- */
    @GET
    @Path("/{orderNo}")
    public Response getOneWithDetails(@PathParam("orderNo") String orderNo) {
        if (isBlank(orderNo)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error("請提供 orderNo")).build();
        }
        try {
            Order order = orderDAO.findWithDetailsByOrderNumber(orderNo);
            if (order == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(error("查無此訂單")).build();
            }
            return Response.ok(order).build();
        } catch (Exception e) {
            return Response.serverError()
                    .entity(error("查詢失敗：" + e.getMessage()))
                    .build();
        }
    }

    /* -----------------------------
     * 查單筆訂單明細
     * ----------------------------- */
    @GET
    @Path("/{orderNumber}/details")
    public Response getOrderDetails(@PathParam("orderNumber") String orderNumber) {
        try {
            List<OrderDetail> details = orderDAO.findDetailsByOrderNumber(orderNumber);
            return Response.ok(details).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(error("查詢明細失敗：" + e.getMessage())).build();
        }
    }

    /* -----------------------------
     * 建立訂單 + 明細（JSON）
     * ----------------------------- */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createOrder(CreateOrderRequest body, @Context UriInfo uriInfo) {
        // 基本驗證
        if (body == null || isBlank(body.customerId) || isBlank(body.paymentMethod)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error("缺少必要欄位：customerId / paymentMethod")).build();
        }
        if (body.details == null || body.details.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error("明細不可為空")).build();
        }

        try {
            // 建立 Order
            Order order = new Order();
            order.setCustomerId(body.customerId);
            order.setPaymentMethod(body.paymentMethod);
            order.setOrderDate(body.orderDate != null ? body.orderDate : new Date());

            // 明細轉換 & 金額計算
            List<OrderDetail> details = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;

            for (CreateOrderDetail i : body.details) {
                // 必填檢查
                if (isBlank(i.productId) || isBlank(i.productName) || isBlank(i.storeName)) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(error("每筆明細需包含 productId / productName / storeName")).build();
                }
                if (i.unitPrice == null || i.quantity == null || i.quantity <= 0) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(error("每筆明細需包含合法的 unitPrice / quantity")).build();
                }

                BigDecimal unit = i.unitPrice;
                BigDecimal sub = (i.subtotal != null)
                        ? i.subtotal
                        : unit.multiply(BigDecimal.valueOf(i.quantity));

                OrderDetail d = new OrderDetail();
                d.setProductId(i.productId);
                d.setProductName(i.productName);
                d.setStoreName(i.storeName);
                d.setUnitPrice(unit);
                d.setQuantity(i.quantity);
                d.setSubtotal(sub);

                details.add(d);
                total = total.add(sub);
            }

            // 以後端計算為準，避免前端竄改
            order.setTotalAmount(total);

            // 實際建單（會自動產生 order_number，且與明細關聯）
            Order saved = orderDAO.createOrderWithDetails(order, details);

            // 建立 201 Created 回應 + Location
            UriBuilder ub = uriInfo.getAbsolutePathBuilder().path(saved.getOrderNumber());
            return Response.created(ub.build()).entity(saved).build();

        } catch (Exception e) {
            return Response.serverError()
                    .entity(error("建立訂單失敗：" + e.getMessage()))
                    .build();
        }
    }
    @GET
    @Path("/all")
    public Response getAllOrdersWithDetails() {
        try {
            List<Order> list = orderDAO.findByDateRange("1970-01-01", "2100-12-31");
            return Response.ok(list).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("查詢失敗：" + e.getMessage()).build();
        }
    }

    /* ===================== 協助方法 & DTO ===================== */

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private boolean isValidYmd(String ymd) {
        try {
            new SimpleDateFormat("yyyy-MM-dd").parse(ymd);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Map<String, Object> error(String msg) {
        return Collections.singletonMap("message", msg);
    }

    /** 建單請求 DTO（用於接收 JSON） */
    public static class CreateOrderRequest {
        public String customerId;
        public String paymentMethod;
        public Date orderDate; // 可選；不給就用現在
        public List<CreateOrderDetail> details;
    }

    public static class CreateOrderDetail {
        public String productId;
        public String productName;
        public String storeName;   // DB NOT NULL
        public BigDecimal unitPrice;
        public Integer quantity;
        public BigDecimal subtotal; // 可選；未提供則以 unitPrice*quantity 計
    }
}
