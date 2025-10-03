package service;


import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dao.MemberDAO;
import entity.Member;

@Path("/members")
public class MemberService {
	
	MemberDAO dao = new MemberDAO();
	
	/*
	 * 查看全部會員
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
public Response getCurrentMember(@Context HttpServletRequest request) {
        Member loginUser = (Member) request.getSession().getAttribute("loginUser");
        if (loginUser == null) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("尚未登入").build();
        }
        Member currentMember = dao.findMemberByMemberId(loginUser.getMemberId()); 
        if (currentMember == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("會員資料不存在").build();
        }
        return Response.ok(currentMember).build();
    } 
	
	/*
	 * 註冊
	 */
	@POST
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	public Response addMember(@FormParam("phone") String phone, @FormParam("email")String email, @FormParam("password")String password) {
		boolean flag = dao.addMember(phone, email, password);
		if(flag) {
			return Response.status(Response.Status.CREATED).build();
		}else {
			return Response.status(Response.Status.BAD_REQUEST).build();
		}
	}
	
	
	/*
	 * 註冊時判斷有沒有註冊過
	 */
	@POST
	@Path("/addMemberCheck")
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Produces(MediaType.TEXT_PLAIN)
	public Response addMemberCheck(@FormParam("phone") String phone, @FormParam("email") String email) {
	    Member phoneIsAdd = dao.findMemberByMemberPhone(phone);
	    Member emailIsAdd = dao.findMemberByMemberEmail(email);

	    if (phoneIsAdd != null && emailIsAdd != null) {
	        return Response.status(Response.Status.CONFLICT)
	                       .entity("此手機和此信箱已註冊")
	                       .build();
	    } else if (phoneIsAdd != null) {
	        return Response.status(Response.Status.CONFLICT)
	                       .entity("此手機號碼已註冊")
	                       .build();
	    } else if (emailIsAdd != null) {
	        return Response.status(Response.Status.CONFLICT)
	                       .entity("此信箱已註冊")
	                       .build();
	    } else {
	        // 沒有重複，可以註冊
	        return Response.ok("可以註冊").build();
	    }
	}

	
	
	/*
	 * 登入後，後端Member會傳入前端，設成Session資料
	 */
	@POST
	@Path("/login")
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED) //可以接收前端表單
	@Produces(MediaType.APPLICATION_JSON)
	public Response login(@FormParam("keyword") String keyword, @FormParam("password") String password, @Context HttpServletRequest request) {
		Member member = dao.login(keyword, password);
		if(member!=null) {
			request.getSession(true).setAttribute("loginUser", member);
			return Response.ok(member).build();
		}else {
			return Response.status(Response.Status.UNAUTHORIZED).entity("登入失敗，帳號或密碼錯誤").build();
		}
	}
	
	/*
	 * 登出
	 */
	@POST
	@Path("/logout")
	@Produces(MediaType.APPLICATION_JSON)
	public Response logout(@Context HttpServletRequest request) {
	    // 檢查是否有登入的使用者
	    Member member = (Member) request.getSession(false).getAttribute("loginUser");
	    
	    if (member != null) {
	        request.getSession(false).invalidate();		//刪除 session使用者資訊
	        return Response.ok("登出成功").build();
	    } else {
	        return Response.status(Response.Status.BAD_REQUEST).entity("您尚未登入").build();
	    }
	}
	
	
	/*
	 * 登入後，按升級成賣家
	 */
	@PUT
	@Path("/upgradeSeller")
	@Produces(MediaType.APPLICATION_JSON)
	public Response upgradeToSeller(@Context HttpServletRequest request) {
	    Member loginUser = (Member) request.getSession().getAttribute("loginUser");

	    if (loginUser == null) {
	        return Response.status(Response.Status.UNAUTHORIZED).entity("請先登入").build();
	    }

	    boolean success = dao.upgradeToSeller(loginUser.getMemberId());

	    if (success) {
	        loginUser.setRole("SELLER");  // Session 也更新
	        return Response.ok("已升級為賣家").build();
	    } else {
	        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
	                       .entity("升級失敗").build();
	    }
	}

	
	/*
	 * 使用者進基本資料去修改
	 */
	@PUT
	@Path("/updateMember")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateMember(@Context HttpServletRequest request, Member updatedMember) {
	    Member loginUser = (Member) request.getSession().getAttribute("loginUser");

	    if (loginUser == null) {
	        return Response.status(Response.Status.UNAUTHORIZED).entity("尚未登入，無法修改").build();
	    }

	    String memberId = loginUser.getMemberId();

	    if (updatedMember == null) {
	        return Response.status(Response.Status.BAD_REQUEST)
	                       .entity("Invalid member data").build();
	    }

	    Member member = dao.updateMember(memberId, updatedMember);
	    if (member != null) {
	        // 更新 session 中的會員資訊（避免前端顯示舊資料）
	        request.getSession().setAttribute("loginUser", member);
	        return Response.ok(member).build();
	    } else {
	        return Response.status(Response.Status.NOT_FOUND)
	                       .entity("Member not found or update failed").build();
	    }
	}
	
	
	/*
	 * 使用者登入後可以自行刪除帳號
	 */
	@DELETE
	@Path("/deleteMember")
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteMember(@Context HttpServletRequest request) {
		Member member = (Member) request.getSession(false).getAttribute("loginUser");
		
		if(member==null) {
			return Response.status(Response.Status.UNAUTHORIZED).entity("{\"message\":\"尚未登入或 Session 過期\"}").build();	
		}else {
			try {
				boolean isdelete = dao.deleteMember(member.getMemberId());
				
				if(isdelete) {
					return Response.ok("{\"message\":\"會員刪除成功！\"}").build();
				}else {
					return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("{\"message\":\"刪除失敗，請稍後再試\"}").build();
				}
			}catch(Exception e) {
				return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("{\"message\": \"伺服器錯誤，請稍後再試。\"}").build();
			}
		}
	
	}

	
	
	

}
