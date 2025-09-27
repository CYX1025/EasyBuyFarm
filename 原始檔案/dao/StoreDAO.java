package dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;

import entity.Store;

public class StoreDAO {
	EntityManager createConnection() {
    	EntityManagerFactory factory=Persistence.createEntityManagerFactory("easybuyfarm");
    	return factory.createEntityManager();
    }
	
	 public List<Store> getAllStore(){
	    	
	    	EntityManager mgr=createConnection();
	    	TypedQuery<Store> data= mgr.createNamedQuery("Store.findAll", Store.class);
	    	
	    	return data.getResultList();
	    }
}
