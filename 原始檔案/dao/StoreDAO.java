package dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;

import entity.Store;

public class StoreDAO {
	EntityManager createConnection() 
	{
    	EntityManagerFactory factory=Persistence.createEntityManagerFactory("easybuyfarm");
    	return factory.createEntityManager();
    }
	
	 public List<Store> getAllStore()
	 {
	    	
	    	EntityManager mgr=createConnection();
	    	TypedQuery<Store> data= mgr.createNamedQuery("Store.findAll", Store.class);
	    	
	    	return data.getResultList();
	 }
	 
	 public boolean addStore(Store store)
	 {
		 EntityManager mgr=createConnection();
		 try
		 {
			 mgr.getTransaction().begin();
			 mgr.persist(store);
			 mgr.getTransaction().commit();
			 return true;
		 }
		 
		 catch(Exception ex)
		 {
			 System.out.println("Add Store Error "+ex.getMessage());
		 }
		 finally 
		 {
			 mgr.close();
		 }
		 return false ;
	 }
}
