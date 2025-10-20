CREATE DATABASE  IF NOT EXISTS `easybuyfarm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `easybuyfarm`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: easybuyfarm
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `orderdetails`
--

DROP TABLE IF EXISTS `orderdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_orderdetails_orderNumber` (`order_id`),
  CONSTRAINT `fk_orderdetails_orderNumber` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetails`
--

LOCK TABLES `orderdetails` WRITE;
/*!40000 ALTER TABLE `orderdetails` DISABLE KEYS */;
INSERT INTO `orderdetails` VALUES (1,'ORD-20251003-79158714','P002','有機小黃瓜','蔬菜賣場',80.00,1,80.00),(2,'ORD-20251003-79158714','P001','新鮮番茄','好水果賣場',50.00,2,100.00),(3,'ORD-20251008-05640969','P002','有機小黃瓜','蔬菜賣場',80.00,1,80.00),(4,'ORD-20251008-05640969','P001','新鮮番茄','好水果賣場',50.00,2,100.00),(5,'ORD-20251008-05942263','P002','有機小黃瓜','蔬菜賣場',80.00,1,80.00),(6,'ORD-20251008-05942263','P001','新鮮番茄','好水果賣場',50.00,2,100.00),(7,'ORD-20251008-09331170','P002','有機小黃瓜','蔬菜賣場',80.00,1,80.00),(8,'ORD-20251008-09331170','P001','新鮮番茄','好水果賣場',50.00,2,100.00),(9,'ORD-20251015-0001','P-1001','蘋果','台北一店',35.50,3,106.50),(10,'ORD-20251015-0001','P-2002','香蕉','台北一店',25.00,2,50.00),(11,'ORD-20251015-0003','P-1001','蘋果','台北一店',50.50,3,106.50),(12,'ORD-20251015-0003','P-2002','香蕉','台北一店',25.00,2,50.00),(13,'ORD-20251015-00004','P-1001','蘋果','台北一店',509.00,3,106.50),(14,'ORD-20251015-00004','P-2002','香蕉','台北一店',25.00,2,50.00);
/*!40000 ALTER TABLE `orderdetails` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-15 11:58:16
