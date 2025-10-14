package service;

import java.util.List;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dao.ProductDAO;
import entity.Product;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
public class ProductService {

    private final ProductDAO dao = new ProductDAO();

    /**
     * 依商品名稱關鍵字做「模糊搜尋」
     * 呼叫方式：
     *   GET /api/products/search?q=番茄
     */
    @GET
    @Path("/search")
    public Response search(@QueryParam("product") String q) {
        if (q == null || q.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                           .entity("{\"message\":\"請提供查詢參數 q\"}")
                           .build();
        }
        List<Product> list = dao.findByProductName(q.trim());
        return Response.ok(list).build();
    }

    /**
     * （可選）不帶條件時回傳全部商品，方便前端列表初始化
     *   GET /api/products
     */
    @GET
    public Response getAll() {
        // 你若已有 getAllProducts() 就呼叫它；暫時用空字串模糊查全部也可
        List<Product> list = dao.findByProductName(""); // 這會回傳全部（LIKE '%%'）
        return Response.ok(list).build();
    }
}
