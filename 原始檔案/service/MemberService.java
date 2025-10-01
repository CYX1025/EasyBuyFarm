package service;


import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
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
	public List<Member> getAllMembers(){
		return dao.getAllMembers();
		
	}
	
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response addMember(String phone, String email, String password) {
		boolean flag = dao.addMember(phone, email, password);
		if(flag) {
			return Response.status(Response.Status.CREATED).build();
		}else {
			return Response.status(Response.Status.BAD_REQUEST).build();
		}
	}
	
	
	
	@GET
	@Path("/{memberId}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response findMemberByMemberId(@PathParam("memberId") String memberId) {
		Member m1 = dao.findMemberByMemberId(memberId);
		if(m1!=null) {
			return Response.ok().entity(m1).build();
		}else {
			return Response.noContent().build();
		}
	}
	
	
	@POST
	@Path("/login")
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED) //可以接收前端表單
	@Produces(MediaType.APPLICATION_JSON)
	public Response login(@FormParam("keyword") String keyword, @FormParam("password") String password) {
		Member member = dao.login(keyword, password);
		if(member!=null) {
			return Response.ok(member).build();
		}else {
			return Response.status(Response.Status.UNAUTHORIZED).entity("登入失敗，帳號或密碼錯誤").build();
		}
	}
	
	
	@PUT
    @Path("/{memberId}")
	@Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response updateMember(@PathParam("memberId") String memberId, Member updatedMember) {
		Member member = dao.updateMember(memberId, updatedMember);
		if(member!=null) {
			return Response.ok(member).build();
		}else {
			return Response.status(Response.Status.NOT_FOUND)
					.entity("Member not found or update failed").build();
		}
	}
	
	
	

}
