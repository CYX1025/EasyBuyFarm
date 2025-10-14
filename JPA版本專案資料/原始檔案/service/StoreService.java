package service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;


import entity.Store;
import dao.StoreDAO;

@Path("/stores")
public class StoreService {
	StoreDAO dao =new StoreDAO();
	    
	 @GET
	 @Produces(MediaType.APPLICATION_JSON)
	 public List<Store> getAll()
	 {
	   List<Store> data= dao.getAllStore();
	   return data;
	 }
	 /**
	     * 模糊搜尋賣場名稱
	     * 呼叫方式：
	     *  easybuyfarm/api/stores/search?name=水果
	     */
	    @GET
	    @Path("/search")
	    public Response search(@QueryParam("name") String name) {
	        if (name == null || name.trim().isEmpty()) {
	            return Response.status(Response.Status.BAD_REQUEST)
	                           .entity("{\"message\":\"請提供查詢參數 name\"}")
	                           .build();
	        }
	        List<Store> list = dao.findByStoreName(name.trim());
	        return Response.ok(list).build();
	    }
	/*@POST
	 @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	 @Produces(MediaType.APPLICATION_JSON)
	 public Response createStore(
				 @FormParam("storename") String storeName,
				 @FormParam("storeintroduce") String storeintroduce, 
				 @FormParam("storeimg")String storeImg,
				 @FormParam("member") String memberId)
		 {
			 try 
			 {
			
		     Store store = new Store(storeName, storeintroduce,storeImg);
			 boolean flag=dao.addStore(store,memberId);
			 	if(flag)
			 	{
			 		return Response.ok(store).build();
			 	}
			 	else
			 	{
			 		return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
	                     .entity("Upload failed").build();
			 	}
			 } 
			 catch (Exception e) 
			 {
				e.printStackTrace();
				return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
		                .entity("Upload failed: " + e.getMessage()).build();
			 }
			
		 }*/
	 
	 //試做圖片上傳，但功能有問題先註解掉
	/*@POST
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createStore(
			 @FormParam("storeid") String storeId,
			 @FormParam("memberid") String memberId,
			 @FormParam("storename") String storeName,
			 @FormParam("storeintroduce") String storeintroduce, 
			 @FormDataParam("storeimg") InputStream uploadedInputStream,       // 圖片內容
			 @FormDataParam("storeimg") FormDataContentDisposition fileDetail  // 檔案資訊
			 )
	 {
		 try 
		 {
		 String uploadDir = "C:/images/";
	     String storeImg = fileDetail.getFileName();
	     String filePath = uploadDir + storeImg;
	 
	     Files.copy(uploadedInputStream, new File(filePath).toPath(), StandardCopyOption.REPLACE_EXISTING);
	     Store store = new Store(storeId, memberId, storeName, storeintroduce,storeImg);
		 boolean flag=dao.addStore(store);
		 	if(flag)
		 	{
		 		return Response.ok(store).build();
		 	}
		 	else
		 	{
		 		return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                     .entity("Upload failed").build();
		 	}
		 } 
		 catch (IOException e) 
		 {
			e.printStackTrace();
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
	                .entity("Upload failed: " + e.getMessage()).build();
		 }
		
	 }*/
	 
	 //使用id找賣場
	 @GET
	 @Path("/{Id}")
	 @Produces(MediaType.APPLICATION_JSON)
	 public Response findStoreById(@PathParam("Id") int id) 
	 {
			Store s1 = dao.findById(id);
			if(s1!=null) 
			{
				return Response.ok().entity(s1).build();
			}
			else 
			{
				return Response.noContent().build();
			}
	 }
	 
	 
	 //使用會員ID查找賣場
	 //功能有問題要找一下為啥
	/* @GET
	 @Path("/{memberId}")
	 @Produces(MediaType.APPLICATION_JSON)
	 public Response findStoreByMemberId(@PathParam("memberId") String memberId) 
	 {
		Store s1 = dao.findByMemberId(memberId);
		if(s1!=null) 
		{
			return Response.ok().entity(s1).build();
		}
		else 
		{
			return Response.noContent().build();
		}
	 }*/
	 
	 //用id修改賣場
	 @PUT
	 @Path("/{Id}")
	 @Consumes(MediaType.APPLICATION_JSON)
	 @Produces(MediaType.APPLICATION_JSON)
	 public Response updateStore(@PathParam("Id") int id, Store updatestore) 
	 {
		Store store = dao.updateStore(id, updatestore);
		if(store!=null) 
		{
			return Response.ok(store).build();
		}
		else 
		{
			return Response.status(Response.Status.NOT_FOUND)
					.entity("store not found or update failed").build();
		}
	 }
	 
	 //用id刪除賣場
	 @DELETE
	 @Path("/{Id}")
	 @Produces(MediaType.APPLICATION_JSON)
	 public Response deleteStore(@PathParam("id") int id)
	 {
		 boolean deleted=dao.deleteStore(id);
		 if(deleted)
		 {
			 return Response.ok("{\"message\": \"Store deleted successfully\"}").build(); 
		 }
		 else
		 {
			 return Response.status(Response.Status.NOT_FOUND)
					 .entity("{\"error\": \"Store not found or delete failed\"}")
					 .build();
		 }
	 }
}
