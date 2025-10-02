package dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;

import entity.Member;
import entity.Store;

public class StoreDAO {
	public static void main(String[] args) 
	{
		List<Store> test=new StoreDAO().findByMemberId("sn202509240001");
		for(Store i:test)
		{
			System.out.println("找到這個惹"+i.getName()+i.getIntroduce());
		}
		
	}
	EntityManager createConnection() 
	{
    	EntityManagerFactory factory=Persistence.createEntityManagerFactory("easybuyfarm");
    	return factory.createEntityManager();
    }
	
	//產生商店id流水號
		private String generateStoreId(EntityManager mgr) {
	        String prefix = "S";
	        String lastId = mgr.createQuery(
	                "SELECT MAX(s.storeId) FROM Store s", String.class)
	                .getSingleResult();

	        if (lastId == null) {
	            return prefix + "001"; // 第一筆
	        }

	        int num = Integer.parseInt(lastId.substring(1)) + 1;
	        return prefix + String.format("%03d", num);
	    }
	
	//瀏覽所有賣場
	public List<Store> getAllStore()
	 {
	    	
	    	EntityManager mgr=createConnection();
	    	TypedQuery<Store> data= mgr.createNamedQuery("Store.findAll", Store.class);
	    	
	    	return data.getResultList();
	 }
	 
	//新增賣場
	 public boolean addStore(Store store,String memberId)
	 {
		 EntityManager mgr=createConnection();
		 try
		 {
			 mgr.getTransaction().begin();
			
			 //帶入memberId
			 MemberDAO memberDao=new MemberDAO();
			 Member member = memberDao.findMemberByMemberId(memberId);
		        if (member == null) {
		            throw new RuntimeException("Member not found: " + memberId);
		        }
			 
			 String newId = generateStoreId(mgr);
		     store.setStoreId(newId);
		     store.setMemberId(memberId);
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
	 
	 //使用主鍵id找尋資料
	 //find()只能用來找有設定成主鍵@Id的欄位
	 public Store findById(int id)
	 {
		 EntityManager mgr = createConnection(); 
		    try {
		        return mgr.find(Store.class, id);
		    } 
		    catch(Exception e )
		    {
		    	System.out.println("Find Store error: " + e.getMessage());
		    	return null; 
		    } 
	 }
	 
	 //使用會員id找尋賣場
	 public List<Store> findByMemberId(String memberId)
	 {
		 EntityManager mgr = createConnection();
		 TypedQuery<Store> query = mgr.createQuery(
			        "SELECT s FROM Store s WHERE s.memberId = :memberId", Store.class);
			    query.setParameter("memberId", memberId);
			    return query.getResultList();
	 }
	 
	 //使用賣場名稱找賣場，模糊搜尋，前後都加了萬用字元
	 public List<Store> findByStoreName(String name)
	 {
		 EntityManager mgr = createConnection();
		 try 
		 {
		 TypedQuery<Store>query=mgr.createQuery(
				 "SELECT s FROM Store s WHERE s.name LIKE :name",Store.class);
		 query.setParameter("name","%"+ name + "%");
		 return query.getResultList();
		 }
		 
		 finally
		 {
			 mgr.close();
		 }
	 }
	 
	 //根據ID，修改賣場資料
	 public Store updateStore(int id,Store store)
	 {
		 EntityManager mgr = createConnection();
		 Store updatestore=mgr.find(Store.class,id);
		 if(updatestore==null)
		 {
			 return null;
		 }
		 try 
		 {
			 mgr.getTransaction().begin();
			 updatestore.setName(store.getName());
			 updatestore.setIntroduce(store.getIntroduce());
			 updatestore.setStoreImg(store.getStoreImg());
			 Store mergedStore = mgr.merge(updatestore);
			 mgr.getTransaction().commit();
			

		     return mergedStore;
		 } 
		 catch (Exception e) 
		 {
			 mgr.getTransaction().rollback();
			 System.out.println("Update Store error: " + e.getMessage());
		     return null;
		 }
		 finally 
		 {
		     mgr.close();
		 }
	 }
	 
	 //根據ID刪除賣場
	 public boolean deleteStore(int id)
	 {
		 EntityManager mgr=createConnection();
		 try
		 {
			 Store store = mgr.find(Store.class, id);
			 
			 if(store==null)
			 {
				 System.out.println("store null");
				 return false;
			 }
			 mgr.getTransaction().begin();
			 mgr.remove(store);
			 mgr.getTransaction().commit();
			 return true;
		 }
		 catch(Exception e)
		 {
			 mgr.getTransaction().rollback();
			 e.printStackTrace();
		     System.out.println("Delete Store error: " + e.getMessage());
		     return false;
		 }
		 
	 }
}
