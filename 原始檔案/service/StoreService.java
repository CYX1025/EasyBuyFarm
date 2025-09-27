package service;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import entity.Store;
import dao.StoreDAO;

@Path("/stores")
public class StoreService {
	StoreDAO dao =new StoreDAO();
	    
	    @GET
	    @Produces(MediaType.APPLICATION_JSON)
	    public List<Store> getAll(){
	    	List<Store> data= dao.getAllStore();
	    	return data;
	    }
}
