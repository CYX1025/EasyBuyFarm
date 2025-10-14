package dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

import entity.Product;
import util.AutoNumber;

public class ProductDAO {
	//利用產品關鍵字來模糊搜尋
	public List<Product> findByProductName(String name) {
		EntityManager mgr = new util.DbConnection().createConnection();
	    try {
	        TypedQuery<Product> query = mgr.createQuery(
	            "SELECT p FROM Product p WHERE p.name LIKE :name", Product.class);
	        query.setParameter("name", "%" + name + "%");
	        return query.getResultList();
	    } finally {
	        mgr.close();
	    }
	}
	
	
}
