package util;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class DbConnection {
	
	
	public EntityManager createConnection() {
		EntityManagerFactory factory = Persistence.createEntityManagerFactory("easybuyfarm");
		return factory.createEntityManager();
	}
	
	

}
