import { useState, useMemo, useEffect, useCallback } from "react";
import { MapPin, Filter, Navigation, Factory, Warehouse, Loader2, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Link } from "wouter";
import L, { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

interface UserLocation {
  latitude: number;
  longitude: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface PurchaseLocationWithDistance extends PurchaseLocation {
  distance: number;
}

export interface PurchaseLocation {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  district: string;
  type: "factory" | "yard";
  phone?: string;
  operatingHours?: string;
  address?: string;
}

export const purchaseLocations: PurchaseLocation[] = [
  { id: 1, latitude: 9.6048181, longitude: 99.126462, name: "บริษัทท่าชนะน้ำมันปาล์มจำกัด", district: "ท่าชนะ", type: "factory" },
  { id: 2, latitude: 9.509643, longitude: 99.1313617, name: "บริษัท กลุ่มสมอทอง จำกัด (มหาชน) สาขาท่าชนะ", district: "ท่าชนะ", type: "factory" },
  { id: 3, latitude: 9.3208992, longitude: 99.128207, name: "นิวไบโอดีเซล", district: "ท่าฉาง", type: "factory" },
  { id: 4, latitude: 9.2975957, longitude: 99.1425639, name: "บริษัท ธนาปาล์มโปรดักส์จำกัด", district: "ท่าฉาง", type: "factory" },
  { id: 5, latitude: 9.2829377, longitude: 99.1380361, name: "บริษัท ท่าฉางรับเบอร์จำกัด", district: "ท่าฉาง", type: "factory" },
  { id: 6, latitude: 9.1134306, longitude: 99.2660693, name: "ทักษิณปาล์ม(2521)", district: "พุนพิน", type: "factory" },
  { id: 7, latitude: 9.0840312, longitude: 99.4295365, name: "บริษัท แสงศิริอุตสาหกรรมเกษตรจำกัด", district: "กาญจนดิษฐ์", type: "factory" },
  { id: 8, latitude: 9.1168200, longitude: 99.6452714, name: "บริษัท วารีวัชรปาล์มออยล์จำกัด", district: "กาญจนดิษฐ์", type: "factory" },
  { id: 9, latitude: 9.2481596, longitude: 99.6664416, name: "พี.ซี.ปาล์ม (โรงงานสกัดน้ำมันปาล์ม) บ.พี.ซี.ปาล์ม(2550)จำกัด", district: "ดอนสัก", type: "factory" },
  { id: 10, latitude: 8.9626909, longitude: 99.2261209, name: "บริษัท ทักษิณอุตสาหกรรมน้ำมันปาล์ม (1993)จำกัด", district: "พุนพิน", type: "factory" },
  { id: 11, latitude: 8.6128401, longitude: 99.0001336, name: "บริษัท ไทยทาโลว์แอนด์ออยล์จำกัด สาขาบางสวรรค์", district: "พระแสง", type: "factory" },
  { id: 12, latitude: 8.6218143, longitude: 98.9905811, name: "บริษัท ยูนิปาล์มอินดัสทรีจำกัด", district: "คีรีรัฐนิคม", type: "factory" },
  { id: 13, latitude: 8.6291778, longitude: 98.9651056, name: "บริษัท บางสวรรค์น้ำมันปาล์มจำกัด", district: "พระแสง", type: "factory" },
  { id: 14, latitude: 8.6061202, longitude: 98.979654, name: "บริษัท วารีวัชรปาล์มออยล์จำกัด 2", district: "พระแสง", type: "factory" },
  { id: 15, latitude: 8.676517, longitude: 98.80145, name: "บริษัท กลุ่มสมอทอง จำกัด (มหาชน) สาขาที่ 1", district: "พนม", type: "factory" },
  { id: 16, latitude: 8.5333856, longitude: 99.1039699, name: "บริษัท ไทยทาโลว์แอนด์ออยล์จำกัด", district: "ชัยบุรี", type: "factory" },
  { id: 17, latitude: 8.4337233, longitude: 99.0722536, name: "บริษัท ป.พานิชรุ่งเรืองปาล์มออยล์จำกัด", district: "ชัยบุรี", type: "factory" },
  { id: 18, latitude: 8.5361459, longitude: 99.2299094, name: "บริษัท ปาล์มทองคำจำกัด", district: "วิภาวดี", type: "factory" },
  { id: 19, latitude: 8.5190138, longitude: 99.2263858, name: "บริษัท เอส.พี.โอ.อะโกรอินดัสตรี้ส์จำกัด", district: "วิภาวดี", type: "factory" },
  { id: 20, latitude: 8.392403, longitude: 99.227794, name: "บริษัทปาล์มน้ำมันธรรมชาติจำกัด", district: "พระแสง", type: "factory" },
  { id: 101, latitude: 9.18371, longitude: 99.46433, name: "สตางค์ลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 103, latitude: 9.2171, longitude: 99.6038, name: "ดอนหลวงลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 104, latitude: 9.0372816, longitude: 99.5274404, name: "บจ.ลานทอง อินเตอร์กรุ๊ป", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 105, latitude: 9.08388, longitude: 99.42941, name: "บจ.แสงศิริอุตสาหกรรมเกษตร", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 106, latitude: 9.2021, longitude: 99.561203, name: "บจ.พี.ซี.ปาล์ม 2550 (สาขาสวนหมี)", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 107, latitude: 9.0929, longitude: 99.58547, name: "ลานเทเขานา", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 108, latitude: 9.134876, longitude: 99.178204, name: "พระพุทธบาทปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 109, latitude: 9.1395407, longitude: 99.6555441, name: "บจ.เคลียร์วูด เอ็นเนอยี่ แอนด์ เทคโนโลยี ซัพพลาย", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 111, latitude: 9.20558, longitude: 99.50492, name: "ลานปาล์มน้องบ่าว น้องขวัญ", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 112, latitude: 9.0195461, longitude: 99.5732472, name: "ว.ธุรกิจลานเท", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 113, latitude: 9.18755, longitude: 99.49139, name: "ละออลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 114, latitude: 9.021653, longitude: 99.454548, name: "ลานเท พร้อมทรัพย์", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 115, latitude: 9.10664, longitude: 99.41253, name: "ลานปาล์มเขาไฟ", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 116, latitude: 9.099486, longitude: 99.644362, name: "ศิลางามลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 117, latitude: 9.21558, longitude: 99.550628, name: "บริษัท ดีดีที ปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 118, latitude: 9.07813, longitude: 99.65334, name: "ธิติมาลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 119, latitude: 9.1079, longitude: 99.48444, name: "ลานเทปากคู", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 123, latitude: 8.970564, longitude: 99.468798, name: "น้องแบงค์ ยาง-ปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 124, latitude: 9.14085, longitude: 99.53348, name: "ลานปาล์มแม่โมกข์", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 125, latitude: 9.03053, longitude: 99.38737, name: "ลานเทฟ้าใสปาล์ม 2 (สาขาซอย 7)", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 126, latitude: 9.15075, longitude: 99.5533, name: "หจก.พลายวาสปาล์มออยล์", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 129, latitude: 9.1082, longitude: 99.7412, name: "ลานสวนหมี", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 130, latitude: 9.0324, longitude: 99.619, name: "เจริญ ลานปาล์ม สาขา คลองสระ", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 131, latitude: 9.15162, longitude: 99.58956, name: "เจริญลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 132, latitude: 9.24128, longitude: 99.54131, name: "ท่าทอง ลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 133, latitude: 9.18504, longitude: 99.42449, name: "โชคธัญญาพรปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 135, latitude: 9.1263, longitude: 99.4837, name: "บจ.เอส.พี.ปาล์มพารารุ่งเรือง", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 136, latitude: 9.151087, longitude: 99.571236, name: "ลานปาล์มลฤดี,น้องเพียว", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 137, latitude: 9.237047, longitude: 99.570629, name: "บจ.พี.ซี.ปาล์ม (2550) สาขาท่าทอง", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 138, latitude: 9.07796, longitude: 99.65339, name: "ธีระพงศ์ลานปาล์ม (สาขากงหนิง)", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 139, latitude: 9.1873, longitude: 99.4891, name: "บจ.กาญจนดิษฐ์น้ำมันปาล์ม (ดอนกาย)", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 140, latitude: 9.035346, longitude: 99.441601, name: "สีวลีเกษตรภัณฑ์", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 141, latitude: 9.18301, longitude: 99.41333, name: "สหกรณ์นิคมกาญจนดิษฐ์", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 142, latitude: 9.06578, longitude: 99.63464, name: "คอกเสือ ลานปาล์ม-ลานไม้", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 143, latitude: 9.15936, longitude: 99.44876, name: "หจก.บ.วรการปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 144, latitude: 9.1622846, longitude: 99.4857391, name: "บจ.พี.ซี.ปาล์ม (2550)สาขากาญจนดิษฐ์", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 145, latitude: 9.1424, longitude: 99.4844, name: "ดอนยาลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 146, latitude: 9.10626, longitude: 99.60776, name: "สุวิทการยาง (คำสน)", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 147, latitude: 8.97198, longitude: 99.4604, name: "กงตากลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 148, latitude: 9.15662, longitude: 99.5235, name: "ลานพระบาท", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 149, latitude: 9.1321, longitude: 99.4657, name: "ช้างขวาลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 150, latitude: 9.1444, longitude: 99.6588, name: "ศิลางามลานปาล์ม 3", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 152, latitude: 9.0494, longitude: 99.3917, name: "บจ.โก อินเตอร์วู้ด", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 153, latitude: 9.142515, longitude: 99.50162, name: "นิรันดร์ลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 154, latitude: 9.168615, longitude: 99.589492, name: "ลานพระบาท สาขาเขาสิว", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 155, latitude: 9.07824, longitude: 99.42316, name: "บจ.กรีนกลอรี่", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 156, latitude: 8.99237, longitude: 99.410831, name: "ส.ยศเมฆลานเทปาล์มทอง", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 158, latitude: 9.1666458, longitude: 99.6181903, name: "วิสาหกิจชุมชนชาวสวนปาล์มน้ำมัน ท่าอุแท", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 159, latitude: 9.1508, longitude: 99.584, name: "ลานพระบาท (สาขา 2)", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 160, latitude: 9.20466, longitude: 99.5476, name: "บจ.สรรัตน์ลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 161, latitude: 9.1694, longitude: 99.4596, name: "ร้านธนกฤต น้ำยางสด/เศษยาง/ปาล์มน้ำมัน", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 163, latitude: 9.163824, longitude: 99.44553, name: "โชคธัญญาพรปาล์ม 2", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 164, latitude: 9.0447655, longitude: 99.6689431, name: "เพชรวิไล ลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 165, latitude: 9.0572, longitude: 99.631, name: "จันทร์เพชร ลานปาล์ม", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 166, latitude: 9.1257, longitude: 99.478, name: "สีวลีเกษตรภัณฑ์ สาขาถนนเซาท์เทิร์น", district: "กาญจนดิษฐ์", type: "yard" },
  { id: 201, latitude: 9.069346, longitude: 98.922426, name: "น้องน้ำปาล์มทอง", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 202, latitude: 8.94455, longitude: 98.99574, name: "เจริญพรปาล์ม สาขา 1", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 203, latitude: 9.0926, longitude: 98.9654, name: "อนุวัฒน์ รุ่งโรจน์ปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 204, latitude: 9.0396723, longitude: 98.9649905, name: "หจก.เพื่อนลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 205, latitude: 8.9317442, longitude: 98.996005, name: "คีริวรรณ ปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 206, latitude: 9.030411, longitude: 98.948364, name: "ชมรมเกษตรกรสวนปาล์มน้ำมัน", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 207, latitude: 9.014, longitude: 98.907, name: "ลานแก้วมังกร (สาขา 2)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 208, latitude: 9.05966, longitude: 98.97729, name: "บจ.ธนาปาล์มโปรดักส์", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 210, latitude: 8.885647, longitude: 98.960812, name: "ลานเทปาล์มบ้านในพาด", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 211, latitude: 9.06009, longitude: 98.92797, name: "โตนยางปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 212, latitude: 9.0967, longitude: 99.023, name: "ขวัญใจ ปาล์มทอง", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 213, latitude: 9.098444, longitude: 99.02876, name: "ลานเทนพกิต", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 214, latitude: 9.065, longitude: 98.9447, name: "ศรีบุญลือรุ่งเรืองปาล์มทอง 2023", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 215, latitude: 8.93105, longitude: 98.978233, name: "วิสาหกิจชุมชนลานเทปาล์มคลองขนาน", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 217, latitude: 8.941, longitude: 99.051, name: "เสาวณี ลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 218, latitude: 9.0309, longitude: 99.0245, name: "เจริญพรปาล์ม สาขา 2", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 219, latitude: 9.1282782, longitude: 98.9825755, name: "คเชนทร์ ลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 220, latitude: 9.01686, longitude: 99.05054, name: "วริสราปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 221, latitude: 9.08416, longitude: 98.97153, name: "ปากหารลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 222, latitude: 8.8856, longitude: 98.9625, name: "บจ.มานะพณโลจีสติกส์ (ในพาด)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 223, latitude: 8.971421, longitude: 98.92651, name: "หน่วยงาน 6 (โสภณปาล์ม)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 224, latitude: 9.041, longitude: 98.94296, name: "บจ.ทักษิณปาล์ม(2521)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 225, latitude: 9.02864, longitude: 98.919644, name: "เพื่อนลานปาล์ม 2-ลานเช่า", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 226, latitude: 9.038629, longitude: 98.897218, name: "ลานเทกะเปา", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 227, latitude: 9.1507117, longitude: 98.9505536, name: "ลานปาล์มผู้ใหญ่รัช", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 228, latitude: 9.099192, longitude: 98.964935, name: "วิภาวดีปาล์ม (บ้านเอี่ยวพุด)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 229, latitude: 9.06965, longitude: 99.041916, name: "ท่ากระดานลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 230, latitude: 8.9978449, longitude: 99.0303726, name: "ลานเทปาล์มคลองน้ำใส กม.37", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 231, latitude: 9.00897, longitude: 98.93474, name: "อมรเทพลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 233, latitude: 8.982, longitude: 98.9007, name: "ลานปาล์มพิกุลทอง", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 234, latitude: 9.92517, longitude: 98.963061, name: "ลานปาล์มน้ำผุดรุ่งเจริญปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 235, latitude: 8.88962, longitude: 99.03055, name: "เจ๊เขียด ลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 236, latitude: 9.0611553, longitude: 98.9563675, name: "ลานเทผู้ใหญ่มานะ", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 237, latitude: 9.035069, longitude: 98.910011, name: "ลานปาล์ม-ไม้ยาง คลองน้อย", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 238, latitude: 8.8886, longitude: 99.0248, name: "พิพัฒน์น้ำยางสด", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 239, latitude: 9.0571, longitude: 98.8981, name: "วงศธรปาล์ม2", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 240, latitude: 8.9996119, longitude: 98.9160995, name: "พรพ่อแม่ปาล์มทอง", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 241, latitude: 9.09253, longitude: 98.96545, name: "อนุวัตน์ รุ่งโรจน์ปาล์ม (สาขา 2)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 242, latitude: 9.056, longitude: 99.0501, name: "ฉมันปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 243, latitude: 8.88554, longitude: 99.02769, name: "สโมสรปาล์ม (สาขา 2)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 244, latitude: 8.90402, longitude: 99.05154, name: "หจก.เพชรทอง พาราวู้ด สาขา 2", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 245, latitude: 9.0488, longitude: 99.032, name: "พระประสิทธิ์ลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 246, latitude: 9.056967, longitude: 99.032225, name: "หจก.เพื่อนลานปาล์ม (สาขา 2)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 247, latitude: 8.99549, longitude: 98.90541, name: "ลานปาล์มฤทธิ์ศักดา", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 248, latitude: 8.944, longitude: 98.9942, name: "ลานไม้สุขสันต์ (สาขา 3)", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 249, latitude: 8.9103066, longitude: 98.9824032, name: "เบื้องแบบลานปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 250, latitude: 9.05133, longitude: 98.881334, name: "ป๊อก รุ่งเรืองปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 251, latitude: 8.8747, longitude: 98.959, name: "สมเกียรติปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 252, latitude: 9.1062495, longitude: 98.9687264, name: "เจ้า เอ A คีรีรัฐฯ ปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 253, latitude: 9.0709812, longitude: 98.9786581, name: "วิสาหกิจชุมชนสหมิตรบ้านยางปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 254, latitude: 8.9195452, longitude: 99.0622381, name: "คนมั่นปาล์มทอง", district: "คีรีรัฐนิคม", type: "yard" },
  { id: 255, latitude: 9.01138, longitude: 98.96825, name: "พัณนิตา ปาล์ม", district: "คีรีรัฐนิคม", type: "yard" },
  // เคียนซา district yards
  { id: 301, latitude: 8.82819, longitude: 99.16606, name: "โกยีลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 302, latitude: 8.73813, longitude: 99.202981, name: "ทวีทรัพย์ ปาล์มทอง 2", district: "เคียนซา", type: "yard" },
  { id: 303, latitude: 8.737613, longitude: 99.000357, name: "เหลี่ยมเพชร", district: "เคียนซา", type: "yard" },
  { id: 304, latitude: 8.7781, longitude: 99.9816, name: "มากสินลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 305, latitude: 8.7334, longitude: 99.1221, name: "ลานเทเจริญผลภัณฑ์ (บางใหญ่)", district: "เคียนซา", type: "yard" },
  { id: 306, latitude: 8.789447, longitude: 99.059213, name: "ลานเท ช.เจริญปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 307, latitude: 8.848197, longitude: 99.1018022, name: "บจ.ปาล์มพาราวู้ด", district: "เคียนซา", type: "yard" },
  { id: 308, latitude: 8.68958, longitude: 99.1599, name: "ไร่ยาวปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 309, latitude: 8.74209, longitude: 99.16238, name: "กองแก้วปาล์มทอง", district: "เคียนซา", type: "yard" },
  { id: 310, latitude: 8.83153, longitude: 99.15318, name: "หจก. บ.วรการปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 311, latitude: 8.82572, longitude: 99.17346, name: "หจ.ภัทรเดช (2007) กรุ๊ป", district: "เคียนซา", type: "yard" },
  { id: 312, latitude: 8.73222, longitude: 99.02089, name: "พรประเสริฐปาล์มทอง", district: "เคียนซา", type: "yard" },
  { id: 313, latitude: 8.70425, longitude: 99.006578, name: "เหลี่ยมเพชรสุราษฎร์ สาขา ทับใหม่", district: "เคียนซา", type: "yard" },
  { id: 314, latitude: 8.8222, longitude: 99.1698, name: "หจก.แสงตะวันกรุ๊ป", district: "เคียนซา", type: "yard" },
  { id: 315, latitude: 8.82926, longitude: 99.16519, name: "เกษมลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 316, latitude: 8.7423, longitude: 99.2076, name: "มารีนปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 317, latitude: 8.7403, longitude: 99.09, name: "ศักดิ์ชายปาล์ม-สาขาวัดในปราบ", district: "เคียนซา", type: "yard" },
  { id: 318, latitude: 8.7785475, longitude: 99.0800208, name: "ก้องปาล์ม 2000", district: "เคียนซา", type: "yard" },
  { id: 319, latitude: 8.75125, longitude: 98.83872, name: "ธีปกรปาล์มรุ่งเรือง", district: "เคียนซา", type: "yard" },
  { id: 320, latitude: 8.84838, longitude: 99.198095, name: "บจ.ปาล์มพาราวู้ด (สาขา 0002)", district: "เคียนซา", type: "yard" },
  { id: 321, latitude: 8.741306, longitude: 99.01143, name: "ลูกหลานทองขาว", district: "เคียนซา", type: "yard" },
  { id: 322, latitude: 8.77824, longitude: 99.07996, name: "ควนกลิ้งปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 323, latitude: 8.676343, longitude: 99.205654, name: "ไร่ยาวปาล์ม สาขาบ้านควนพร้อม", district: "เคียนซา", type: "yard" },
  { id: 324, latitude: 8.78903, longitude: 99.163391, name: "โชกุนปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 325, latitude: 8.741035, longitude: 98.98185, name: "ลานปาล์มจำเนียร 2", district: "เคียนซา", type: "yard" },
  { id: 326, latitude: 8.709, longitude: 99.043, name: "อิงอั้ม ลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 327, latitude: 8.7557631, longitude: 99.048645, name: "โกแดงปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 328, latitude: 8.68811, longitude: 99.2443, name: "กิจเจริญปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 329, latitude: 8.70622, longitude: 99.01473, name: "นัทธพงศ์ปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 330, latitude: 8.8268, longitude: 99.0769, name: "ลานเทเงินถาวร", district: "เคียนซา", type: "yard" },
  { id: 332, latitude: 8.69346, longitude: 99.00347, name: "ศักดิ์ชายลานเทปาล์ม (สาขา 1)", district: "เคียนซา", type: "yard" },
  { id: 333, latitude: 8.78, longitude: 99.0136, name: "ลานเท แสนสุขปาล์ม สาขา 2", district: "เคียนซา", type: "yard" },
  { id: 334, latitude: 8.67175, longitude: 99.24244, name: "ลานเท STJ ปาล์ม (บางดี)", district: "เคียนซา", type: "yard" },
  { id: 336, latitude: 8.75668, longitude: 99.04902, name: "พงศ์ศักดิ์ลานเท", district: "เคียนซา", type: "yard" },
  { id: 337, latitude: 8.679001, longitude: 99.240222, name: "ศักดิ์ชายลานปาล์ม(อนิรุจน์)", district: "เคียนซา", type: "yard" },
  { id: 338, latitude: 8.6789, longitude: 99.23991, name: "อนิรุตน์ลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 339, latitude: 8.73066, longitude: 99.15958, name: "หจก.เพชรทองพาราวู้ด", district: "เคียนซา", type: "yard" },
  { id: 340, latitude: 8.67203, longitude: 99.11945, name: "ลานไม้ T&T พาราวู้ด", district: "เคียนซา", type: "yard" },
  { id: 342, latitude: 8.718043, longitude: 98.967429, name: "ลานเทแสนสุขปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 343, latitude: 8.76966, longitude: 99.20766, name: "ลานปาล์มศักดิ์ชาย (วัชรินทร์)", district: "เคียนซา", type: "yard" },
  { id: 344, latitude: 8.67433, longitude: 98.99232, name: "ลานเทปาล์มทรัพย์สมพิศ", district: "เคียนซา", type: "yard" },
  { id: 345, latitude: 8.69813, longitude: 99.24767, name: "คลองโร ปาล์มน้ำมัน", district: "เคียนซา", type: "yard" },
  { id: 346, latitude: 8.7506408, longitude: 99.0382359, name: "กลุ่มเกษตรกรทำสวนบ้านพัฒนา จำกัด", district: "เคียนซา", type: "yard" },
  { id: 347, latitude: 8.17077, longitude: 99.07067, name: "ถุงทองลานเท", district: "เคียนซา", type: "yard" },
  { id: 348, latitude: 8.823671, longitude: 99.083592, name: "โรจนะปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 350, latitude: 8.73153, longitude: 99.08922, name: "ศักดิ์ชายลานปาล์ม (สาขาบางโก)", district: "เคียนซา", type: "yard" },
  { id: 351, latitude: 8.73892, longitude: 98.9824458, name: "โชคนภาการยาง", district: "เคียนซา", type: "yard" },
  { id: 352, latitude: 8.831663, longitude: 99.152857, name: "บจ.ปาล์มพาราวู้ด (สาขา 3)", district: "เคียนซา", type: "yard" },
  { id: 353, latitude: 8.785986, longitude: 99.097258, name: "สุขศิริกิจลานเท", district: "เคียนซา", type: "yard" },
  { id: 354, latitude: 8.7682, longitude: 99.2057, name: "แสงทอง ปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 355, latitude: 8.69195, longitude: 99.13444, name: "ลานเทจำเนียร", district: "เคียนซา", type: "yard" },
  { id: 356, latitude: 8.6896719, longitude: 99.037887, name: "ก้าวหน้าเจริญปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 357, latitude: 8.73844, longitude: 99.0083, name: "นายสุนันท์ ดำด้วงโรม", district: "เคียนซา", type: "yard" },
  { id: 358, latitude: 8.690722, longitude: 99.155444, name: "อภิวัฒน์ลานเท", district: "เคียนซา", type: "yard" },
  { id: 359, latitude: 8.7753, longitude: 99.08871, name: "ลานนันทพัฒน์", district: "เคียนซา", type: "yard" },
  { id: 360, latitude: 8.693091, longitude: 99.219387, name: "ลานเทเขาวัง", district: "เคียนซา", type: "yard" },
  { id: 361, latitude: 8.743517, longitude: 99.2293448, name: "ศักดิ์ศิริปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 362, latitude: 8.87145, longitude: 99.21886, name: "สหกรณ์กองทุนสวนยางเกาะแก้วพัฒนา จำกัด", district: "เคียนซา", type: "yard" },
  { id: 363, latitude: 8.6503811, longitude: 99.1182125, name: "ลานเทศักดิ์ชายปาล์ม (สมจิตร)", district: "เคียนซา", type: "yard" },
  { id: 364, latitude: 8.64579, longitude: 99.15147, name: "ณรงศักดิ์ ลานเทปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 365, latitude: 8.6471417, longitude: 99.1753287, name: "ธนกาญจน์ลานเท", district: "เคียนซา", type: "yard" },
  { id: 367, latitude: 8.7376877, longitude: 99.1082437, name: "นายสุนันท์ ดำด้วงโรม (สาขา 2)", district: "เคียนซา", type: "yard" },
  { id: 368, latitude: 8.786823, longitude: 99.163178, name: "ลานเทกำนันขาว", district: "เคียนซา", type: "yard" },
  { id: 369, latitude: 8.862175, longitude: 99.254365, name: "นพฤทธิ์ปาล์มทอง", district: "เคียนซา", type: "yard" },
  { id: 370, latitude: 8.6969929, longitude: 99.2274948, name: "หน้าควนปาล์มทอง", district: "เคียนซา", type: "yard" },
  { id: 371, latitude: 8.6614, longitude: 99.1053, name: "ลานเทผู้ใหญ่จัด", district: "เคียนซา", type: "yard" },
  { id: 372, latitude: 8.7253808, longitude: 99.0046055, name: "ทวีทรัพย์ลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 373, latitude: 8.655932, longitude: 99.1647853, name: "สุนิศา ปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 375, latitude: 8.1864003, longitude: 99.2917674, name: "กิจเจริญปาล์ม (สาขา 2)", district: "เคียนซา", type: "yard" },
  { id: 376, latitude: 8.807, longitude: 99.18, name: "ส พารา", district: "เคียนซา", type: "yard" },
  { id: 377, latitude: 8.69173, longitude: 99.0788, name: "ทับทิมทอง-ธราพรลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 378, latitude: 8.7804766, longitude: 99.1894932, name: "เอ็น ที ทวีทรัพย์ ลานเท", district: "เคียนซา", type: "yard" },
  { id: 379, latitude: 8.7255601, longitude: 99.0225548, name: "บุญนำลานปาล์ม", district: "เคียนซา", type: "yard" },
  { id: 380, latitude: 8.6838, longitude: 99.19, name: "พรุสุ้มปาล์ม", district: "เคียนซา", type: "yard" },
  // ชัยบุรี district yards
  { id: 401, latitude: 8.4040922, longitude: 99.0649918, name: "ชุมทองปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 402, latitude: 8.47172, longitude: 99.05121, name: "ลานทรัพย์ธนดล", district: "ชัยบุรี", type: "yard" },
  { id: 403, latitude: 8.500177, longitude: 99.0483, name: "ทรัพย์รังสีปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 404, latitude: 8.43742, longitude: 99.04222, name: "ลานเทปลายคลอง", district: "ชัยบุรี", type: "yard" },
  { id: 405, latitude: 8.428, longitude: 99.0178, name: "บมจ.สหอุตสาหกรรมน้ำมันปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 406, latitude: 8.5046, longitude: 99.0736, name: "ขำขาลปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 407, latitude: 8.42688, longitude: 99.06887, name: "เทพประทานพรน้ำยางสด (สาขา 2)", district: "ชัยบุรี", type: "yard" },
  { id: 408, latitude: 8.440759, longitude: 99.096821, name: "ป.ภักดีปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 409, latitude: 8.419314, longitude: 99.064427, name: "ลานเทไกรวัฒนพงศ์", district: "ชัยบุรี", type: "yard" },
  { id: 410, latitude: 8.4003038, longitude: 99.1456531, name: "ลานเทสิงชัยปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 411, latitude: 8.39916, longitude: 99.07284, name: "บางปานปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 412, latitude: 8.40298, longitude: 99.06503, name: "ชุมทองปาล์ม (สาขา 2)", district: "ชัยบุรี", type: "yard" },
  { id: 413, latitude: 8.4862, longitude: 99.08447, name: "จันทร์จรัสปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 414, latitude: 8.4657, longitude: 99.07776, name: "เจียรลานเทปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 415, latitude: 8.439935, longitude: 98.981054, name: "ลานเท น้ำมนต์ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 416, latitude: 8.399, longitude: 99.029, name: "ลานเท บางทองปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 417, latitude: 8.77824, longitude: 99.07996, name: "ลานไม้ ส.ทรัพย์ศรีวิเศษ", district: "ชัยบุรี", type: "yard" },
  { id: 418, latitude: 8.47702, longitude: 99.01761, name: "จิรนันต์ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 419, latitude: 8.466139, longitude: 99.013472, name: "เพ็ชรประพันธ์ ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 420, latitude: 8.407889, longitude: 99.039417, name: "จิรนันต์ปาล์ม (สาขา 2)", district: "ชัยบุรี", type: "yard" },
  { id: 421, latitude: 8.5186, longitude: 99.0437, name: "ทิพวรรณปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 422, latitude: 8.4539, longitude: 99.07087, name: "บจ.สิงโตโกเด้นคิง", district: "ชัยบุรี", type: "yard" },
  { id: 423, latitude: 8.4872, longitude: 99.1434, name: "รจนา การค้า", district: "ชัยบุรี", type: "yard" },
  { id: 424, latitude: 8.3893, longitude: 99.074, name: "สุวรรณี การยาง", district: "ชัยบุรี", type: "yard" },
  { id: 425, latitude: 8.3826, longitude: 99.0391, name: "บ่าวโจลานเทปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 430, latitude: 8.5036263, longitude: 99.0510966, name: "คลองน้อยปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 431, latitude: 8.498, longitude: 99.049, name: "นามบุศย์ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 433, latitude: 8.376, longitude: 99.074, name: "ลานเทเรืองรัตน์ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 434, latitude: 8.500515, longitude: 99.009003, name: "วิโรจน์ปาล์มออยล์", district: "ชัยบุรี", type: "yard" },
  { id: 435, latitude: 8.49396, longitude: 99.14748, name: "ทรัพย์ทวีลานปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 436, latitude: 8.48283, longitude: 99.04895, name: "สมจิตรปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 438, latitude: 8.45378, longitude: 99.02758, name: "โชคชัยเจริญปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 439, latitude: 8.4504, longitude: 99.02263, name: "พัทธมนปาล์ม จิราแม็ก", district: "ชัยบุรี", type: "yard" },
  { id: 440, latitude: 8.40705, longitude: 98.99568, name: "จ้าวใหม่ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 441, latitude: 8.416056, longitude: 98.975125, name: "ศรีจันทร์ปาล์ม สาขา 2", district: "ชัยบุรี", type: "yard" },
  { id: 442, latitude: 8.515, longitude: 99.0114, name: "พรอำนวยปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 443, latitude: 8.401127, longitude: 99.14639, name: "ลานเทนิคมปาล์มทอง", district: "ชัยบุรี", type: "yard" },
  { id: 444, latitude: 8.4727, longitude: 98.9866, name: "ลานเท พรปรีดา", district: "ชัยบุรี", type: "yard" },
  { id: 445, latitude: 8.36944, longitude: 99.10512, name: "นัฐกิจปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 446, latitude: 8.4371, longitude: 98.9868, name: "ลานเทควนพรุนปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 447, latitude: 8.3821, longitude: 99.0897, name: "บจ.สวนปาล์มพนมชัย", district: "ชัยบุรี", type: "yard" },
  { id: 448, latitude: 8.41825, longitude: 99.149139, name: "เขาเพ็งลานเท", district: "ชัยบุรี", type: "yard" },
  { id: 449, latitude: 8.4021, longitude: 99.0651, name: "สุชาติปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 450, latitude: 8.396905, longitude: 99.061602, name: "ลานเททรัพย์สมบัติ", district: "ชัยบุรี", type: "yard" },
  { id: 451, latitude: 8.407699, longitude: 99.168311, name: "สมยศ ลานปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 453, latitude: 8.390482, longitude: 99.015838, name: "ศรีจันทร์ปาล์ม สาขา 1", district: "ชัยบุรี", type: "yard" },
  { id: 455, latitude: 8.50057, longitude: 99.009, name: "วิโรจน์ ปาล์มออยล์ (สาขา 2)", district: "ชัยบุรี", type: "yard" },
  { id: 456, latitude: 8.46978, longitude: 99.01855, name: "จันทร์ภุชงค์ปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 457, latitude: 8.392, longitude: 99.0106, name: "ปรึกษาการยาง สาขา 5", district: "ชัยบุรี", type: "yard" },
  { id: 458, latitude: 8.058083, longitude: 99.1057528, name: "หมื่นพันธ์ลานปาล์ม", district: "ชัยบุรี", type: "yard" },
  { id: 459, latitude: 8.42331, longitude: 98.99111, name: "โชคอำนวยปาล์ม", district: "ชัยบุรี", type: "yard" },
  // ไชยา district yards
  { id: 501, latitude: 9.404301, longitude: 99.175821, name: "ธนสารปาล์ม", district: "ไชยา", type: "yard", phone: "081-7872997", address: "124/2 หมู่ 1 ถ.แยกป่าเว-ดอนดวต ต.ป่าเว อ.ไชยา 84110" },
  { id: 502, latitude: 9.4163, longitude: 98.9932, name: "ชมพูพลปาล์ม", district: "ไชยา", type: "yard", phone: "080-0698234", address: "99/1 หมู่ 4 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 503, latitude: 9.43180, longitude: 99.08426, name: "โกตี๋ปาล์ม", district: "ไชยา", type: "yard", phone: "089-8719954", address: "32/2 หมู่ 6 ถ.ทุ่งนางเภา-โมถ่าย ต.โมถ่าย อ.ไชยา 84110" },
  { id: 504, latitude: 9.3993972, longitude: 99.1812097, name: "คงคาชัยปาล์ม", district: "ไชยา", type: "yard", phone: "087-1552657", address: "84/5 หมู่ 4 ต.เวียง อ.ไชยา 84110" },
  { id: 505, latitude: 9.460824, longitude: 99.152847, name: "ชัชวาลปาล์ม", district: "ไชยา", type: "yard", phone: "083-5946541", address: "17/1 หมู่ 6 ถ.สายเอเชีย ต.ป่าเว อ.ไชยา 84110" },
  { id: 506, latitude: 9.49217, longitude: 99.20221, name: "นิวปาล์ม (ตะกรบ)", district: "ไชยา", type: "yard", phone: "081-8935390", address: "109/1 หมู่ 1 ถ.ไชยา-ท่าชนะ ต.ตะกรบ อ.ไชยา 84110" },
  { id: 507, latitude: 9.447127, longitude: 99.206607, name: "ลานปาล์ม ลุงพัน-ป้ากบ", district: "ไชยา", type: "yard", phone: "081-6074521", address: "94 หมู่ 7 ถ.ไชยา-ท่าชนะ ต.ทุ่ง อ.ไชยา 84110" },
  { id: 508, latitude: 9.36024, longitude: 99.17369, name: "ณัชชาปาล์ม", district: "ไชยา", type: "yard", phone: "084-8500097", address: "160/1 หมู่ 6 ต.เลม็ด อ.ไชยา 84150" },
  { id: 509, latitude: 9.43721, longitude: 99.042545, name: "ปากหมากปาล์ม", district: "ไชยา", type: "yard", phone: "081-8950304", address: "85/1 หมู่ 2 ถ.ทุ่งนางเภา-ปากหมาก ต.ปากหมาก อ.ไชยา 84110" },
  { id: 510, latitude: 9.4213, longitude: 99.1387, name: "อาเหลียงลานปาล์ม", district: "ไชยา", type: "yard", phone: "093-9751393", address: "17/12 หมู่ 2 ต.ป่าเว อ.ไชยา 84110" },
  { id: 512, latitude: 9.385569, longitude: 99.186575, name: "โกยูรลานปาล์ม", district: "ไชยา", type: "yard", phone: "061-1748811", address: "39/1 หมู่ 3 ต.เวียง อ.ไชยา 84110" },
  { id: 513, latitude: 9.37822, longitude: 99.171171, name: "ไชยาแรมป์", district: "ไชยา", type: "yard", phone: "077-431531", address: "58/6 หมู่ 3 ถ.สายเอเซีย ต.เวียง อ.ไชยา 84110" },
  { id: 514, latitude: 9.439, longitude: 99.0832, name: "บจ.ธนาปาล์มโปรดักส์ (ลานทุ่งนางเภา)", district: "ไชยา", type: "yard", phone: "063-0788010", address: "83 หมู่ 6 ถ.ป่าเว-ปากหมาก ต.โมถ่าย อ.ไชยา 84110" },
  { id: 515, latitude: 9.442555, longitude: 99.084592, name: "ลานเททุ่งนางเภา (สมอทอง)", district: "ไชยา", type: "yard", phone: "091-8497121", address: "44/8 หมู่ 6 ต.โมถ่าย อ.ไชยา 84110" },
  { id: 516, latitude: 9.48161, longitude: 99.20399, name: "บจ.ธนาปาล์มโปรดักส์ (วังใหม่)", district: "ไชยา", type: "yard", phone: "082-9499654", address: "128/1 หมู่ 1 ต.ตะกรบ อ.ไชยา 84110" },
  { id: 517, latitude: 9.42942, longitude: 98.93600, name: "บัวชู ลานไม้", district: "ไชยา", type: "yard", phone: "085-4229371", address: "355/19 หมู่ 4 ถ.คลองไม้แดง-ไชยา ต.ปากหมาก อ.ไชยา 84110" },
  { id: 518, latitude: 9.43348, longitude: 98.95883, name: "ณัฐพลปาล์ม", district: "ไชยา", type: "yard", phone: "084-7077122", address: "82/6 หมู่ 4 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 519, latitude: 9.4282998, longitude: 98.9688754, name: "กอบแก้วธุรกิจ (สาขาพรุยายชี)", district: "ไชยา", type: "yard", phone: "065-6692656", address: "96/6 หมู่ 4 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 521, latitude: 9.47339, longitude: 98.98779, name: "ชมภูพลปาล์ม (สาขา 2 ห้วยตาหมิง)", district: "ไชยา", type: "yard", phone: "081-9582361", address: "233/6 หมู่ 6 ถ.ปากหมาก-ห้วยตาหมิง ต.ปากหมาก อ.ไชยา 84110" },
  { id: 522, latitude: 9.47862, longitude: 98.96304, name: "อัฐพลปาล์ม-ห้วยตาหมิง", district: "ไชยา", type: "yard", phone: "089-8719954", address: "86/9 หมู่ 6 ถ.ปากหมาก-คลองโสด ต.ปากหมาก อ.ไชยา 84110" },
  { id: 523, latitude: 9.383546, longitude: 99.163865, name: "เมืองใต้ปาล์ม (สาขาหนองแค)", district: "ไชยา", type: "yard", phone: "087-9050705", address: "19/15 หมู่ 1 ต.เวียง อ.ไชยา 84110" },
  { id: 524, latitude: 9.446833, longitude: 99.171861, name: "ทองเพชรลานปาล์ม", district: "ไชยา", type: "yard", phone: "095-4145927", address: "17/5 หมู่ 5 ต.ตลาดไชยา อ.ไชยา 84110" },
  { id: 525, latitude: 9.40117, longitude: 99.08634, name: "บจ.ธนาปาล์มโปรดักส์ (โมถ่าย)", district: "ไชยา", type: "yard", phone: "063-0785588", address: "144/1 หมู่ 2 ต.โมถ่าย อ.ไชยา 84110" },
  { id: 526, latitude: 9.392704, longitude: 99.101265, name: "ลานปาล์มเสวียด สาขา โมถ่าย", district: "ไชยา", type: "yard", phone: "089-8667824", address: "135/2 หมู่ 2 ต.โมถ่าย อ.ไชยา 84110" },
  { id: 527, latitude: 9.4687203, longitude: 99.2054225, name: "จุดรับซื้อห้วยพุน (สมอทอง)", district: "ไชยา", type: "yard", phone: "095-3577338", address: "56/1 หมู่ 3 ต.ตะกรบ อ.ไชยา 84110" },
  { id: 528, latitude: 9.416361, longitude: 98.989809, name: "บจ.ธนาปาล์มโปรดักส์ สาขา พรุยายชี", district: "ไชยา", type: "yard", phone: "089-7241663", address: "10/2 หมู่ 4 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 529, latitude: 9.404885, longitude: 99.132774, name: "การันลานปาล์ม", district: "ไชยา", type: "yard", phone: "081-5352599", address: "8 หมู่ 2 ถ.ไชยา-แยกโมถ่าย ต.ป่าเว อ.ไชยา 84110" },
  { id: 530, latitude: 9.4478543, longitude: 99.207124, name: "คงคาชัยปาล์ม (ทุ่ง)", district: "ไชยา", type: "yard", phone: "081-9588898", address: "87/1 หมู่ 4 ต.ทุ่ง อ.ไชยา 84110" },
  { id: 532, latitude: 9.42309, longitude: 99.02831, name: "ช.ช่วยพัฒนาปาล์ม", district: "ไชยา", type: "yard", phone: "089-8758985", address: "36/8 หมู่ 3 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 533, latitude: 9.472958, longitude: 99.1569694, name: "ลานห้วยไผ่", district: "ไชยา", type: "yard", phone: "095-4145927", address: "203/2 หมู่ 4 ถ.สายเอเซีย ต.ป่าเว อ.ไชยา 84110" },
  { id: 534, latitude: 9.50006, longitude: 99.22229, name: "จุดรับซื้อตะกรบ (ธนาปาล์ม)", district: "ไชยา", type: "yard", phone: "089-4744350", address: "53/1 หมู่ 1 ต.ตะกรบ อ.ไชยา 84110" },
  { id: 535, latitude: 9.399659, longitude: 99.20871, name: "หนองมนปาล์ม สาขา 2", district: "ไชยา", type: "yard", phone: "084-9339032", address: "118 หมู่ 5 ถ.ไชยา ต.ทุ่ง อ.ไชยา 84110" },
  { id: 536, latitude: 9.472958, longitude: 99.1569694, name: "บริษัท ท่าชนะน้ำมันปาล์ม (จุดรับซื้อ)", district: "ไชยา", type: "yard", phone: "087-6291083", address: "52/5 หมู่ 6 ถ.สายเอเซีย ต.ป่าเว อ.ไชยา 84110" },
  { id: 537, latitude: 9.44807, longitude: 99.20724, name: "คงคาชัยปาล์ม สาขา2", district: "ไชยา", type: "yard", phone: "081-9558898", address: "93 หมู่ 8 ถ.ไชยา-ท่าชนะ ต.ทุ่ง อ.ไชยา 84110" },
  { id: 538, latitude: 9.40242, longitude: 99.07834, name: "ลุ่มกระท่อมลานปาล์ม", district: "ไชยา", type: "yard", phone: "085-4743531", address: "59/1 หมู่ 5 ถ.แยกไชยา-โมถ่าย ต.โมถ่าย อ.ไชยา 84110" },
  { id: 539, latitude: 9.42509, longitude: 99.08400, name: "ชมภูพลปาล์ม 2", district: "ไชยา", type: "yard", phone: "080-8955699", address: "68 หมู่ 6 ถ.แยกโมถ่าย-ทุ่งนางเภา ต.โมถ่าย อ.ไชยา 84110" },
  { id: 540, latitude: 9.404981, longitude: 98.893184, name: "เอ็น.ซี.ลานรับซื้อปาล์ม", district: "ไชยา", type: "yard", phone: "082-8188261", address: "323/9 หมู่ 7 ถ.ไชยา-ปากหมาก ต.ปากหมาก อ.ไชยา 84110" },
  { id: 541, latitude: 9.45625, longitude: 99.23302, name: "สหกรณ์เครดิตยูเนียนบ้านตะกรบ", district: "ไชยา", type: "yard", phone: "077-280668", address: "119 หมู่ 2 ต.ตะกรบ อ.ไชยา 84110" },
  { id: 543, latitude: 9.430500, longitude: 98.937043, name: "ชมภูพลปาล์ม (ปากหมาก)", district: "ไชยา", type: "yard", phone: "081-8949395", address: "355/41 หมู่ 4 ถ.ทุ่งนางเภา-เขาหลัก ต.ปากหมาก อ.ไชยา 84110" },
  { id: 544, latitude: 9.40795, longitude: 99.20807, name: "หนองมนปาล์ม", district: "ไชยา", type: "yard", phone: "084-9339032", address: "93/1 หมู่ 5 ถ.ไชยาสายล่าง ต.ทุ่ง อ.ไชยา 84110" },
  { id: 545, latitude: 9.434334, longitude: 99.207257, name: "หน่วยงาน 4 ตะกรบ (สมอทอง)", district: "ไชยา", type: "yard", address: "119 หมู่ 4 ต.ทุ่ง อ.ไชยา 84110" },
  { id: 546, latitude: 9.434145, longitude: 98.956817, name: "รุ่งเรืองการยาง", district: "ไชยา", type: "yard", phone: "093-6109092", address: "82/4 หมู่ 4 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 547, latitude: 9.36055, longitude: 99.20431, name: "ตรัวทักษิณลานปาล์ม", district: "ไชยา", type: "yard", phone: "081-7974227", address: "126/2 หมู่ 4 ต.เลม็ด อ.ไชยา 84110" },
  { id: 548, latitude: 9.41604, longitude: 99.50557, name: "ลานเท ช.ทองบุญ รุ่งเรืองกิจ", district: "ไชยา", type: "yard", phone: "082-8362145", address: "65 หมู่ 4 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 549, latitude: 9.407526, longitude: 99.170348, name: "บจ.ชุมพร เอส.พี.ปาล์มออย", district: "ไชยา", type: "yard", phone: "085-2609248", address: "หมู่ 1 ต.ป่าเว อ.ไชยา 84110" },
  { id: 550, latitude: 9.40195, longitude: 99.20392, name: "ลานปาล์ม บ้านเรา", district: "ไชยา", type: "yard", phone: "087-8881379", address: "29/30 หมู่ 1 ต.ทุ่ง อ.ไชยา 84110" },
  { id: 551, latitude: 9.47811, longitude: 98.9719, name: "ฤกษ์มีชัยการยาง-ปาล์ม", district: "ไชยา", type: "yard", phone: "081-2765048", address: "240/5 หมู่ 6 ต.ปากหมาก อ.ไชยา 84110" },
  { id: 552, latitude: 9.469983, longitude: 99.080677, name: "สุราษฎร์ เอส เอส ซี", district: "ไชยา", type: "yard", phone: "081-3703630", address: "58 หมู่ 6 ต.โมถ่าย อ.ไชยา 84110" },
  { id: 553, latitude: 9.371, longitude: 99.1, name: "บจ.กลุ่มสมอทอง หน่วยงานที่ 17 (บ้านทือ)", district: "ไชยา", type: "yard", phone: "081-9689495", address: "90 หมู่ 3 ต.โมถ่าย อ.ไชยา 84110" },
  // ดอนสัก district yards
  { id: 601, latitude: 9.12307, longitude: 99.69149, name: "โสภณพืชไร่", district: "ดอนสัก", type: "yard", phone: "081-8932639", address: "174/4 หมู่ 1 ถ.สุราษฎร์ธานี-นครศรีธรรมราช ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 602, latitude: 9.23115, longitude: 99.59216, name: "ลานพระบาทปาล์ม", district: "ดอนสัก", type: "yard", phone: "095-4279000", address: "26/4 หมู่ 5 ถ.พระพุทธบาท ต.ชลคราม อ.ดอนสัก 84160" },
  { id: 603, latitude: 9.05353599, longitude: 99.678935, name: "ลานปาล์ม โชคมณี", district: "ดอนสัก", type: "yard", phone: "096-9479108", address: "313 หมู่ 6 ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 604, latitude: 9.2423, longitude: 99.6981, name: "ลานพระบาท", district: "ดอนสัก", type: "yard", address: "37/5 หมู่ 1 ถ.บ้านใน-ดอนสัก ต.ดอนสัก อ.ดอนสัก 84220" },
  { id: 605, latitude: 9.82285417, longitude: 99.6705923, name: "ดอนเสาธงทองปาล์ม", district: "ดอนสัก", type: "yard", phone: "081-8926743", address: "32/7 หมู่ 7 ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 606, latitude: 9.25865, longitude: 99.68048, name: "ส.ศิริวรรณลานปาล์ม", district: "ดอนสัก", type: "yard", phone: "081-7872997", address: "36/1 หมู่ 2 ถ.ห้วยเสียด-พระพุทธบาท ต.ดอนสัก อ.ดอนสัก 84220" },
  { id: 607, latitude: 9.20543, longitude: 99.62669, name: "โชคชัยเกษตรภัณฑ์", district: "ดอนสัก", type: "yard", phone: "077-934033", address: "12/2 หมู่ 1 ถ.ไชยคราม-บ้านเลียบ ต.ไชยคราม อ.ดอนสัก 84220" },
  { id: 608, latitude: 9.22939, longitude: 99.63119, name: "ศ.รุ่งเรืองลานปาล์ม", district: "ดอนสัก", type: "yard", phone: "086-9426304", address: "45 หมู่ 5 ถ.ศรีไชยคราม-บ้านเบียบ ต.ไชยคราม อ.ดอนสัก 84160" },
  { id: 609, latitude: 9.26854, longitude: 99.76575, name: "ชัยชนะลานปาล์ม", district: "ดอนสัก", type: "yard", phone: "085-7913065", address: "146/1 หมู่ 14 ถ.ดอนสัก-ขนอม ต.ดอนสัก อ.ดอนสัก 84220" },
  { id: 611, latitude: 9.246753, longitude: 99.2000071, name: "ลานปาล์มปั๊มพีทีน้ำฉา", district: "ดอนสัก", type: "yard", phone: "081-5394870", address: "63/1 หมู่ 1 ถ.บ้านใน-ดอนสัก ต.ดอนสัก อ.ดอนสัก 84220" },
  { id: 613, latitude: 9.05000, longitude: 99.71455, name: "โกศลการยาง", district: "ดอนสัก", type: "yard", phone: "089-9099721", address: "4 หมู่ 11 ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 614, latitude: 9.2411, longitude: 99.7342, name: "ณัฐภัทรลานเท", district: "ดอนสัก", type: "yard", phone: "080-5212244", address: "24/4 หมู่ 9 ต.ดอนสัก อ.ดอนสัก 84220" },
  { id: 615, latitude: 9.22797, longitude: 99.69281, name: "ลานไม้น้องเอ๋ สาขา 2 คอกช้าง", district: "ดอนสัก", type: "yard", phone: "061-9712101", address: "36/6 หมู่ 1 ต.ดอนสัก อ.ดอนสัก 84220" },
  { id: 616, latitude: 9.07066, longitude: 99.68423, name: "ลานปาล์มน้องบ่าว-น้องขวัญ", district: "ดอนสัก", type: "yard", phone: "087-8824909", address: "288/3 หมู่ 6 ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 617, latitude: 9.14091, longitude: 99.67627, name: "ช.ช้างปาล์มไม้", district: "ดอนสัก", type: "yard", phone: "081-7376434", address: "5/1 หมู่ 14 ถ.บ้านใน-ดอนสัก ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 618, latitude: 9.18149, longitude: 99.67189, name: "แววการยาง", district: "ดอนสัก", type: "yard", phone: "081-8926743", address: "114/4 หมู่ 4 ถ.บ้านใน-ดอนสัก ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 619, latitude: 9.22845, longitude: 99.67068, name: "ดอนเสาธงปาล์มทอง", district: "ดอนสัก", type: "yard", address: "30/3 หมู่ 7 ซ.สำนักสงฆ์ดอนเสาธง ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 620, latitude: 9.19957, longitude: 99.67645, name: "คีรีวงปาล์ม", district: "ดอนสัก", type: "yard", phone: "089-2917334", address: "3/2 หมู่ 2 ถ.บ้านใน-ดอนสัก ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 622, latitude: 9.12280, longitude: 99.70386, name: "บจ.พี.ซี.ปาล์ม (2550) สาขาดอนสัก", district: "ดอนสัก", type: "yard", phone: "081-9704316", address: "354 หมู่ 16 ต.ปากแพรก อ.ดอนสัก 84340" },
  { id: 623, latitude: 9.19415, longitude: 99.63445, name: "ณัฐพงศ์ ปาล์มยาง", district: "ดอนสัก", type: "yard", phone: "085-7869550", address: "37 หมู่ 1 ต.ไชยคราม อ.ดอนสัก" },
  { id: 624, latitude: 9.177625, longitude: 99.370171, name: "ธีรพงษ์ ลานปาล์ม", district: "ดอนสัก", type: "yard", phone: "085-7966100", address: "4 หมู่ 4 ต.ไชยคราม อ.ดอนสัก 84160" },
  { id: 625, latitude: 9.1898799, longitude: 99.6797504, name: "เอกการเกษตร (ปาล์มและยาง)", district: "ดอนสัก", type: "yard", phone: "098-6718399", address: "44/1 หมู่ 14 ต.ปากแพรก อ.ดอนสัก 84340" },
  // ท่าฉาง district yards
  { id: 702, latitude: 9.228844, longitude: 99.1602, name: "ลานปาล์มหนองนนท์", district: "ท่าฉาง", type: "yard", phone: "061-1834691", address: "109/11 หมู่ 7 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 703, latitude: 9.28385, longitude: 99.01321, name: "กอบแก้วปาล์ม", district: "ท่าฉาง", type: "yard", phone: "096-6365956", address: "64/3 หมู่ 2 ถ.วิภาวดี-ท่าฉาง ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 704, latitude: 9.245968, longitude: 99.1408, name: "นาครเกษตรปาล์ม", district: "ท่าฉาง", type: "yard", phone: "094-9639744", address: "162/3 หมู่ 5 ถ.สายเอเชีย ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 705, latitude: 9.3306, longitude: 99.1089, name: "เมืองใต้ปาล์ม", district: "ท่าฉาง", type: "yard", phone: "098-7333929", address: "127 หมู่ 8 ถ.เสวียด-กิ่งวิภาวดี ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 706, latitude: 9.255605, longitude: 99.0927429, name: "ลานเทคงแก้ว", district: "ท่าฉาง", type: "yard", phone: "062-2266074", address: "72/1 หมู่ 8 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 707, latitude: 9.3441, longitude: 99.1034, name: "ลานแก้วมณี สาขา 3", district: "ท่าฉาง", type: "yard", phone: "081-6070037", address: "25 หมู่ 4 ถ.เสวียด-โมถ่าย ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 708, latitude: 9.235862, longitude: 99.17788, name: "บ้านห้วยวู้ดชิพ", district: "ท่าฉาง", type: "yard", phone: "081-8917570", address: "6/2 หมู่ 1 ถ.พุนพิน-ไชยา ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 710, latitude: 9.235147, longitude: 99.140096, name: "ทวีเดชเกษตรปาล์ม", district: "ท่าฉาง", type: "yard", phone: "081-9701769", address: "171/1 หมู่ 7 ถ.เอเชีย 41 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 711, latitude: 9.2044395, longitude: 99.1612294, name: "ลานเทคลองไทรปาล์ม", district: "ท่าฉาง", type: "yard", phone: "081-9797669", address: "38/1 หมู่ 2 ถ.พุนพิน-ไชยา ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 713, latitude: 9.18517, longitude: 99.1562, name: "ปิยวัฒน์ปาล์ม", district: "ท่าฉาง", type: "yard", phone: "082-8745466", address: "123/6 หมู่ 8 ต.คลองไทร อ.ท่าฉาง" },
  { id: 715, latitude: 9.365, longitude: 99.049, name: "ลานเทกำนัน สาขาท่าแบก", district: "ท่าฉาง", type: "yard", phone: "089-5878139", address: "153/15 หมู่ 2 ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 716, latitude: 9.2773517, longitude: 99.0283588, name: "โชคอนุชัยปาล์ม", district: "ท่าฉาง", type: "yard", phone: "081-7199935", address: "66/1 หมู่ 2 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 717, latitude: 9.20113, longitude: 99.16787, name: "ดอนเลียบปาล์ม", district: "ท่าฉาง", type: "yard", phone: "081-9795062", address: "77/1 หมู่ 7 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 718, latitude: 9.35733, longitude: 98.97616, name: "เกษตรก้าวหน้าปาล์ม", district: "ท่าฉาง", type: "yard", phone: "085-7936805", address: "139 หมู่ 4 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 719, latitude: 9.331, longitude: 99.10444, name: "ลานปาล์มเสวียด", district: "ท่าฉาง", type: "yard", phone: "089-8667824", address: "75/9 หมู่ 2 ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 720, latitude: 9.2157, longitude: 99.0771, name: "พิษณุพงษ์ การยาง", district: "ท่าฉาง", type: "yard", address: "52/2 หมู่ 3 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 721, latitude: 9.215764, longitude: 99.077129, name: "บจ.กลุ่มปาล์มธรรมชาติ (คลองไทร)", district: "ท่าฉาง", type: "yard", phone: "081-1312943", address: "46/5 หมู่ 3 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 722, latitude: 9.337764, longitude: 99.129214, name: "นิพัฒน์ลานปาล์ม", district: "ท่าฉาง", type: "yard", phone: "084-8504242", address: "56/1 หมู่ 3 ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 723, latitude: 9.27367, longitude: 99.0083, name: "เพชรตาปี", district: "ท่าฉาง", type: "yard", phone: "099-6105489", address: "40/7 หมู่ 2 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 724, latitude: 9.2783772, longitude: 99.0109985, name: "เพชรตาปี ลานปาล์ม", district: "ท่าฉาง", type: "yard", phone: "085-6557507", address: "55/2 หมู่ 2 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 725, latitude: 9.274298, longitude: 99.086421, name: "ลานปาล์มคลองวัว", district: "ท่าฉาง", type: "yard", phone: "089-8682481", address: "16/1 หมู่ 4 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 726, latitude: 9.29589, longitude: 99.08424, name: "แหลมสนปาล์ม", district: "ท่าฉาง", type: "yard", phone: "083-3940476", address: "101/4 หมู่ 5 ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 727, latitude: 9.3186769, longitude: 99.1450119, name: "อรุณมาลี", district: "ท่าฉาง", type: "yard", phone: "077-389622", address: "43/5 หมู่ 6 ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 728, latitude: 9.328, longitude: 99.0886612, name: "ลานเทแก้วมณี", district: "ท่าฉาง", type: "yard", phone: "081-6077337", address: "62 หมู่ 2 ถ.ควนรา-วิภาวดี ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 729, latitude: 9.2247898, longitude: 99.1394914, name: "หจก.ขุนเลลาเท็กซ์ สาขา 2", district: "ท่าฉาง", type: "yard", phone: "099-9765006", address: "104/1 หมู่ 4 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 730, latitude: 9.26157, longitude: 99.10441, name: "ในพรุ การเกษตร", district: "ท่าฉาง", type: "yard", phone: "087-2776526", address: "59/2 หมู่ 8 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 731, latitude: 9.22282, longitude: 99.17329, name: "ทวีเดชเกษตรปาล์ม สาขา 3", district: "ท่าฉาง", type: "yard", phone: "081-9701769", address: "70/2 หมู่ 3 ถ.เทพประชา ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 732, latitude: 9.24105, longitude: 99.1811, name: "บจ.สมอทองน้ำมันปาล์ม (ท่าฉาง)", district: "ท่าฉาง", type: "yard", phone: "089-8738485", address: "5/4 หมู่ 1 ถ.พุนพิน-ไชยา ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 733, latitude: 9.31097, longitude: 99.09642, name: "กล่ำไพลานปาล์ม", district: "ท่าฉาง", type: "yard", phone: "081-9587659", address: "124/2 หมู่ 8 ถ.ห้วยธัมมัง ต.เสวียด อ.ท่าฉาง 84150" },
  { id: 734, latitude: 9.29257, longitude: 99.18219, name: "เสาวนีย์ ลานปาล์ม", district: "ท่าฉาง", type: "yard", phone: "081-7974227", address: "22/3 หมู่ 4 ต.เขาถ่าน อ.ท่าฉาง 84150" },
  { id: 735, latitude: 9.16934, longitude: 99.14025, name: "บจ.พี.ซี ปาล์ม (2550) ท่าฉาง", district: "ท่าฉาง", type: "yard", phone: "077-268425", address: "162 หมู่ 8 ถ.เอเชีย 41 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 736, latitude: 9.204501, longitude: 99.160527, name: "จุดรับซื้อ จำนงค์ปาล์ม", district: "ท่าฉาง", type: "yard", phone: "083-3894898", address: "99/9 หมู่ 2 ถ.ไชยา-สายล่าง ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 737, latitude: 9.289719, longitude: 99.020885, name: "ลานไม้โชคพงศ์ศิริ 55", district: "ท่าฉาง", type: "yard", phone: "081-0803723", address: "125 หมู่ 2 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 738, latitude: 9.2038, longitude: 99.1423, name: "ลานไม้ทรัพย์เจริญ", district: "ท่าฉาง", type: "yard", phone: "081-3971207", address: "38/5 หมู่ 3 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 739, latitude: 9.290105, longitude: 99.191504, name: "เขาถ่านลานปาล์ม (น้องพีม)", district: "ท่าฉาง", type: "yard", phone: "087-4641199", address: "82/1 หมู่ 4 ต.เขาถ่าน อ.ท่าฉาง 84150" },
  { id: 740, latitude: 9.2890356, longitude: 99.01763, name: "ลานเททรัพย์เจริญ 1688", district: "ท่าฉาง", type: "yard", phone: "088-7531739", address: "65/12 หมู่ 2 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 741, latitude: 9.29102, longitude: 99.02747, name: "สหกรณ์ผู้ปลูกปาล์มน้ำมันท่าฉาง-วิภาวดี", district: "ท่าฉาง", type: "yard", phone: "098-3863998", address: "108 หมู่ 2 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 742, latitude: 9.2535, longitude: 99.1896, name: "บจ.พี.ซี.ปาล์ม (2550) สาขาท่าฉาง", district: "ท่าฉาง", type: "yard", phone: "086-4702731", address: "269/4 หมู่ 1 ต.ท่าฉาง อ.ท่าฉาง 84150" },
  { id: 743, latitude: 9.2150, longitude: 99.1402, name: "ลาน จำเนียร", district: "ท่าฉาง", type: "yard", phone: "089-5897250", address: "120/1 หมู่ 4 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 744, latitude: 9.161447, longitude: 99.164423, name: "บจ.กลุ่มสมอทอง (บ้านมะลวน)", district: "ท่าฉาง", type: "yard", phone: "091-8497121", address: "29 หมู่ 5 ต.คลองไทร อ.ท่าฉาง 84150" },
  { id: 745, latitude: 9.2578, longitude: 99.1113, name: "ลานเท เกิดสมบัติ", district: "ท่าฉาง", type: "yard", phone: "085-6902802", address: "12/1 หมู่ 8 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 746, latitude: 9.2065, longitude: 99.192616, name: "ลานปาล์มประชารัฐบ้านใหญ่", district: "ท่าฉาง", type: "yard", phone: "086-2819059", address: "หมู่ 3 ต.ท่าเคย อ.ท่าฉาง 84150" },
  { id: 747, latitude: 9.3948961, longitude: 98.9261821, name: "ลานเท ส.เสวตจันทร์", district: "ท่าฉาง", type: "yard", phone: "080-0380120", address: "243/1 หมู่ 5 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  { id: 748, latitude: 9.364989, longitude: 98.940894, name: "ส.เพชรสวัสดิ์ เจริญทรัพย์", district: "ท่าฉาง", type: "yard", phone: "090-1697339", address: "293/2 หมู่ 6 ต.ปากฉลุย อ.ท่าฉาง 84150" },
  // ท่าชนะ district yards
  { id: 801, latitude: 9.598, longitude: 98.917, name: "บจ.ท่าชนะน้ำมันปาล์ม (ผู้เช่า)", district: "ท่าชนะ", type: "yard", phone: "087-8942990", address: "124/313 หมู่ 23 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 802, latitude: 9.50336, longitude: 99.12920, name: "นิวปาล์ม (ต.ประสงค์)", district: "ท่าชนะ", type: "yard", phone: "081-8935390", address: "222/1 หมู่ 4 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 803, latitude: 9.649233, longitude: 98.99894, name: "บจ.ธนปาล์มโปรดักส์ สาขา สัมปัง", district: "ท่าชนะ", type: "yard", phone: "085-5630468", address: "227 หมู่ 6 ถ.คันธุลี-คลองโสด ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 804, latitude: 9.49952, longitude: 99.20089, name: "เขาถ่านลานปาล์ม (น้องพีม) ท่าชนะ", district: "ท่าชนะ", type: "yard", phone: "089-7292078", address: "67 หมู่ 2 ถ.ไชยา-ท่าชนะ ต.วัง อ.ท่าชนะ 84170" },
  { id: 805, latitude: 9.588, longitude: 99.128, name: "ประเสริฐปาล์ม", district: "ท่าชนะ", type: "yard", phone: "081-8935390", address: "114 หมู่ 1 ถ.สายเอเชีย ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 806, latitude: 9.536096, longitude: 99.1522836, name: "ลานเทปารีชาติ ลาน2", district: "ท่าชนะ", type: "yard", phone: "089-8720331", address: "299 หมู่ 5 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 807, latitude: 9.6344, longitude: 99.01218, name: "อุทัยปาล์ม", district: "ท่าชนะ", type: "yard", phone: "098-7362149", address: "33 หมู่ 12 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 808, latitude: 9.621878, longitude: 98.930540, name: "เอกชัยลานปาล์มคลองสลิง", district: "ท่าชนะ", type: "yard", phone: "081-8923435", address: "80 หมู่ 21 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 809, latitude: 9.58095, longitude: 98.92757, name: "บจ.กลุ่มสมอทอง สาขา 2 (คลองโสด)", district: "ท่าชนะ", type: "yard", phone: "064-9159920", address: "121/493 หมู่ 13 ถ.ทุ่งตาเพชร-ทุ่งนางเภา ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 810, latitude: 9.51904, longitude: 98.98279, name: "ลานปาล์มหินเพิง", district: "ท่าชนะ", type: "yard", phone: "084-8457203", address: "142 หมู่ 14 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 811, latitude: 9.518822, longitude: 98.931996, name: "บจ.ล้อมเพชรวู้ด", district: "ท่าชนะ", type: "yard", phone: "077-923546", address: "120/152 หมู่ 15 ถ.สี่แยกหนองนิล-บ้านคลองรอก ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 812, latitude: 9.492037, longitude: 98.901909, name: "ลานผู้ใหญ่โจ้ ศรีเมือง (สาขาท่าใหม่)", district: "ท่าชนะ", type: "yard", phone: "087-2665021", address: "หมู่ 17 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 813, latitude: 9.53600, longitude: 99.15228, name: "บุญประสงค์ลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "089-6825304", address: "250 หมู่ 5 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 814, latitude: 9.6457, longitude: 99.1573, name: "หน่วยงาน 8 ดอนธูป (สมอทอง)", district: "ท่าชนะ", type: "yard", phone: "091-8497121", address: "283 หมู่ 3 ถ.ท่าชนะ-ละแม(สายล่าง) ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 815, latitude: 9.6854548, longitude: 99.0769795, name: "บจ.ธนาปาล์มโปรดักส์ (ควนสูง)", district: "ท่าชนะ", type: "yard", phone: "089-8735824", address: "หมู่ 10 ต.คันธุลี อ.ท่าชนะ 84210" },
  { id: 816, latitude: 9.5903, longitude: 98.9820, name: "บจ.กลุ่มสมอทอง สาขาที่ 2", district: "ท่าชนะ", type: "yard", phone: "091-8497121", address: "146 หมู่ 19 ถ.สมอทอง-คลองโสด ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 817, latitude: 9.469062, longitude: 99.18045, name: "ลานปาล์มเขาพนมแบก", district: "ท่าชนะ", type: "yard", phone: "062-2453588", address: "240 หมู่ 1 ถ.สายเอเซีย ต.วัง อ.ท่าชนะ 84170" },
  { id: 818, latitude: 9.48996, longitude: 99.20194, name: "ลานปาล์มผู้ใหญ่โต้ง", district: "ท่าชนะ", type: "yard", phone: "086-2831566", address: "20 หมู่ 1 ต.วัง อ.ท่าชนะ 84170" },
  { id: 819, latitude: 9.5377, longitude: 98.9174, name: "กลุ่มเกษตรกรทำสวนปาล์ม ลานปาล์มบ้านไร่ยาว", district: "ท่าชนะ", type: "yard", phone: "062-2439997", address: "123/253 หมู่ 16 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 820, latitude: 9.65610, longitude: 98.98037, name: "หน่วยงาน 2 (สัมปัง) สมอทอง", district: "ท่าชนะ", type: "yard", phone: "081-9588701", address: "159/325 หมู่ 6 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 821, latitude: 9.56918, longitude: 99.11998, name: "หน่วยงาน 5 หนองนิล (สมอทอง)", district: "ท่าชนะ", type: "yard", phone: "081-9682120", address: "157/1 หมู่ 10 ต.สมอทอง อ.ท่าชนะ 84170" },
  { id: 822, latitude: 9.6342, longitude: 98.9388, name: "คงทองลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "089-8668588", address: "124/327 หมู่ 11 ถ.คันธุลี-คลองโสด ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 823, latitude: 9.575911, longitude: 98.928656, name: "บจ.พี.เจ.ปาล์ม (คลองโสด)", district: "ท่าชนะ", type: "yard", phone: "083-6422936", address: "121/569 หมู่ 13 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 824, latitude: 9.51068, longitude: 99.17285, name: "นิวปาล์ม (เกาะมุก)", district: "ท่าชนะ", type: "yard", phone: "081-8935390", address: "323 หมู่ 6 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 825, latitude: 9.5614862, longitude: 98.9351196, name: "เจ๊กิ๊กปาล์มทอง", district: "ท่าชนะ", type: "yard", phone: "084-8421466", address: "169 หมู่ 18 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 826, latitude: 9.62346, longitude: 99.02913, name: "หน่วยงานชงโคลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "081-8929455", address: "178 หมู่ 12 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 827, latitude: 9.55320, longitude: 99.16253, name: "บจ.ท่าชนะน้ำมันปาล์ม (หน่วยงานแม่นางสงค์)", district: "ท่าชนะ", type: "yard", phone: "062-2453594", address: "132 หมู่ 7 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 829, latitude: 9.575465, longitude: 99.183552, name: "ลานปาล์มกำนันวีระ", district: "ท่าชนะ", type: "yard", phone: "081-9790958", address: "1/1 หมู่ 3 ถ.ไชยา-ท่าชนะ ต.ท่าชนะ อ.ท่าชนะ 84170" },
  { id: 830, latitude: 9.693305, longitude: 99.085321, name: "หน่วยงาน 16 (ควนสูง) สมอทอง", district: "ท่าชนะ", type: "yard", phone: "087-2670018", address: "11/1 หมู่ 10 ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 832, latitude: 9.6484169, longitude: 98.9500822, name: "บจ.พี.เจ.ปาล์มออยล์ (น้ำรอบ)", district: "ท่าชนะ", type: "yard", phone: "086-2695863", address: "195/1 หมู่ 11 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 834, latitude: 9.58781, longitude: 99.16418, name: "บรรจงลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "093-7933789", address: "41 หมู่ 10 ต.ท่าชนะ อ.ท่าชนะ 84170" },
  { id: 835, latitude: 9.603492, longitude: 99.086967, name: "หน่วยงาน 14-ลานคลองพา (สมอทอง)", district: "ท่าชนะ", type: "yard", phone: "081-9682120", address: "114/1 หมู่ 4 ถ.สายเอเซีย ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 836, latitude: 9.65907, longitude: 99.15073, name: "คันธุลีลานปาล์ม (พี.เจ.)", district: "ท่าชนะ", type: "yard", phone: "081-9790228", address: "84/1 หมู่ 2 ถ.ไชยา-ท่าชนะ ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 837, latitude: 9.67633, longitude: 98.96884, name: "ลานป้าเอียด (ธนาปาล์ม)", district: "ท่าชนะ", type: "yard", phone: "085-7947482", address: "158/310 หมู่ 7 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 838, latitude: 9.5532904, longitude: 99.1998749, name: "ลานเทบ้านทุ่งแมว (สมอทอง)", district: "ท่าชนะ", type: "yard", phone: "083-5554342", address: "97/1 หมู่ 7 ต.วัง อ.ท่าชนะ 84170" },
  { id: 840, latitude: 9.59909, longitude: 98.971384, name: "ลานปาล์ม สมอทอง (แม่ทะล่างหมู่ 19)", district: "ท่าชนะ", type: "yard", phone: "086-4414996", address: "124/12 หมู่ 19 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 844, latitude: 9.6375, longitude: 99.0091, name: "เพชรลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "083-1758611", address: "158/188 หมู่ 6 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 846, latitude: 9.4859, longitude: 99.1198, name: "นะโก๊ะรงค์การเกษตร", district: "ท่าชนะ", type: "yard", phone: "084-6694910", address: "15 หมู่ 4 ต.สมอทอง อ.ท่าชนะ 84170" },
  { id: 847, latitude: 9.5282, longitude: 98.9264, name: "ลานปาล์มลานไม้ (เจ๊เอี้ยง)", district: "ท่าชนะ", type: "yard", phone: "089-8736460", address: "120/7 หมู่ 15 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 848, latitude: 9.613487, longitude: 98.926846, name: "ลานเทคลองสลิง (สมอทอง)", district: "ท่าชนะ", type: "yard", phone: "081-9797830", address: "121/180 หมู่ 21 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 849, latitude: 9.5966, longitude: 98.93037, name: "กลุ่มเกษตรกรทำสวนประสงค์", district: "ท่าชนะ", type: "yard", phone: "093-7797588", address: "121/559 หมู่ 20 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 850, latitude: 9.65687, longitude: 99.10654, name: "บจ.ธนาปาล์มโปรดักส์ (ลานคันธุลี)", district: "ท่าชนะ", type: "yard", phone: "063-0780002", address: "หมู่ 9 ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 851, latitude: 9.54371, longitude: 98.91219, name: "ภูมิพัฒน์ลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "081-9585214", address: "175 หมู่ 16 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 852, latitude: 9.68811, longitude: 99.14371, name: "บจ.ชุมพร เอส.พี.ปาล์มออยล์ (คันธุลี)", district: "ท่าชนะ", type: "yard", phone: "085-2609248", address: "107/2 หมู่ 11 ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 853, latitude: 9.671733, longitude: 99.128112, name: "บจ.ซานมู้ อินเตอร์เนชั่นแนล", district: "ท่าชนะ", type: "yard", phone: "084-7148878", address: "73/1 หมู่ 7 ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 854, latitude: 9.5705, longitude: 99.1758, name: "บจ.ชุมพร เอส.พี.ปาล์มออย (ท่าชนะ)", district: "ท่าชนะ", type: "yard", phone: "085-2609248", address: "561 หมู่ 4 ต.ท่าชนะ อ.ท่าชนะ 84170" },
  { id: 855, latitude: 9.6020, longitude: 99.1371, name: "บจ.กลุ่มสมอทอง (หน่วยงาน 21)", district: "ท่าชนะ", type: "yard", phone: "064-0170264", address: "7/2 หมู่ 2 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 856, latitude: 9.595032, longitude: 98.923709, name: "บจ.ธนาปาล์มโปรดักส์ (สาขาคลองสงค์)", district: "ท่าชนะ", type: "yard", phone: "097-3135538", address: "140 หมู่ 13 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 857, latitude: 9.67636, longitude: 98.96888, name: "บจ.ธนาปาล์มโปรดักส์ ท่าไทย", district: "ท่าชนะ", type: "yard", phone: "063-0785885", address: "158/311 หมู่ 7 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 858, latitude: 9.58522, longitude: 98.98943, name: "บจ.ธนาปาลมโปรดักส์ (ลานเขาเพลา)", district: "ท่าชนะ", type: "yard", phone: "077-270999", address: "หมู่ 8 ต.สมอทอง อ.ท่าชนะ 84170" },
  { id: 859, latitude: 9.676055, longitude: 99.073701, name: "บจ.ชุมพร เอส.พี.ปาล์มออย (หน่วย10)", district: "ท่าชนะ", type: "yard", phone: "085-2609248", address: "177/3 หมู่ 10 ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 860, latitude: 9.606, longitude: 99.167, name: "บจ.ธนาปาล์มโปรดักส์ (หนองสีป้อ)", district: "ท่าชนะ", type: "yard", phone: "089-8735824", address: "276 หมู่ 10 ต.ท่าชนะ อ.ท่าชนะ 84170" },
  { id: 861, latitude: 9.6086, longitude: 99.0661, name: "บจ.เสถียรปาล์ม (สาขาบ้านกลาง)", district: "ท่าชนะ", type: "yard", phone: "061-1721278", address: "289 หมู่ 5 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 863, latitude: 9.4806382, longitude: 99.2034487, name: "ลานเกาะชะมวง", district: "ท่าชนะ", type: "yard", phone: "085-7988484", address: "117 หมู่ 1 ต.วัง อ.ท่าชนะ 84170" },
  { id: 865, latitude: 9.64668, longitude: 99.05824, name: "เอกชัย ลานไม้-ลานปาล์ม", district: "ท่าชนะ", type: "yard", phone: "086-7029125", address: "124 หมู่ 9 ต.คันธุลี อ.ท่าชนะ 84170" },
  { id: 866, latitude: 9.512903, longitude: 98.931439, name: "เปรมฤดี ยาง/ปาล์ม", district: "ท่าชนะ", type: "yard", phone: "091-7701059", address: "120/66 หมู่ 15 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 867, latitude: 9.52482, longitude: 99.039579, name: "ลานเทปาริชาติ", district: "ท่าชนะ", type: "yard", phone: "089-8720331", address: "205 หมู่ 24 ต.ประสงค์ อ.ท่าชนะ 84170" },
  { id: 868, latitude: 9.657413, longitude: 98.9762324, name: "กลุ่มออมทรัพย์เพื่อการเกษตรบ้านสัมปัง", district: "ท่าชนะ", type: "yard", phone: "099-1953554", address: "159/723 หมู่ 6 ต.คลองพา อ.ท่าชนะ 84170" },
  { id: 869, latitude: 9.568305, longitude: 99.05399, name: "พี่จุ๊บลานเท (บ้านห้วยน้ำฝน)", district: "ท่าชนะ", type: "yard", phone: "080-0868956", address: "33 หมู่ 6 ต.สมอทอง อ.ท่าชนะ 84170" },
  { id: 870, latitude: 9.5410863, longitude: 99.0467128, name: "ธนาปาล์มโปรดักส์ (สาขาทุ่งพลับ)", district: "ท่าชนะ", type: "yard", phone: "089-8735824", address: "93 หมู่ 5 ต.สมอทอง อ.ท่าชนะ 84170" },
  // บ้านตาขุน district yards
  { id: 901, latitude: 8.928294, longitude: 98.91809, name: "วรวุฒิปาล์ม", district: "บ้านตาขุน", type: "yard", phone: "080-1465948", address: "20/2 หมู่ 2 ต.เขาวง อ.บ้านตาขุน 84250" },
  { id: 902, latitude: 8.92717, longitude: 98.91781, name: "หจก.ยิ่งเจริญ พาราวู้ด", district: "บ้านตาขุน", type: "yard", phone: "095-8984416", address: "60/11 หมู่ 2 ถ.สุราษฎร์-ตะกั่วป่า ต.เขาวง อ.บ้านตาขุน 84230" },
  { id: 903, latitude: 8.899937, longitude: 98.885071, name: "ลานเทห้องชั่งบ้านตาขุน", district: "บ้านตาขุน", type: "yard", phone: "077-261217", address: "108 หมู่ 4 ถ.สุราษฎร์-ตะกั่วป่า ต.เขาวง อ.บ้านตาขุน 84230" },
  { id: 904, latitude: 8.989, longitude: 98.849, name: "ลานน้องแบงค์", district: "บ้านตาขุน", type: "yard", phone: "083-3881483", address: "356/1 หมู่ 4 ต.เขาพัง อ.บ้านตาขุน" },
  { id: 905, latitude: 8.972992, longitude: 98.843829, name: "ลานปาล์มจิรชัย รัชชะ", district: "บ้านตาขุน", type: "yard", phone: "077-346053", address: "16 หมู่ 4 ถ.เขื่อนเชี่ยวหลาน ต.เขาพัง อ.บ้านตาขุน 84230" },
  { id: 906, latitude: 8.93313, longitude: 98.9235, name: "บจ.เค เอ็น พาราวู้ด", district: "บ้านตาขุน", type: "yard", phone: "084-7573446", address: "139 หมู่ 2 ถ.สุราษฎร์ธานี-ตะกั่วป่า ต.เขาวง อ.บ้านตาขุน 84230" },
  { id: 907, latitude: 8.58303, longitude: 98.54024, name: "ลานปาล์มกลุ่มเกษตรกรทำสวนพรุไทย", district: "บ้านตาขุน", type: "yard", phone: "083-391178", address: "53 หมู่ 7 ต.พรุไทย อ.บ้านตาขุน 84230" },
  { id: 909, latitude: 8.93354, longitude: 98.87278, name: "สหกรณ์การเกษตร บ้านตาขุน จำกัด", district: "บ้านตาขุน", type: "yard", phone: "081-6070397", address: "116/19 หมู่ 4 ต.เขาวง อ.บ้านตาขุน 84230" },
  { id: 910, latitude: 8.9427376, longitude: 98.8709413, name: "ควนทองลานเทปาล์ม", district: "บ้านตาขุน", type: "yard", phone: "095-4234888", address: "88/2 หมู่ 2 ถ.สุราษฎร์-ตะกั่วป่า ต.พรุไทย อ.บ้านตาขุน 84130" },
  { id: 911, latitude: 8.9222, longitude: 98.9091, name: "จักรพันธ์ปาล์ม", district: "บ้านตาขุน", type: "yard", phone: "098-0766746", address: "21/27 หมู่ 3 ต.เขาวง อ.บ้านตาขุน" },
  { id: 912, latitude: 8.9085, longitude: 98.887278, name: "สัมพันธ์ปาล์ม", district: "บ้านตาขุน", type: "yard", phone: "080-777333", address: "82/7 หมู่ 4 ต.เขาวง อ.บ้านตาขุน" },
  { id: 913, latitude: 8.9120462, longitude: 98.8420255, name: "สมใจปาล์มทอง", district: "บ้านตาขุน", type: "yard", phone: "087-8891487", address: "หมู่ 6 ต.พะแสง อ.บ้านตาขุน 84250" },
  // บ้านนาเดิม district yards
  { id: 921, latitude: 8.929231, longitude: 99.238478, name: "ชัยวัฒน์ปาล์มทอง", district: "บ้านนาเดิม", type: "yard", phone: "087-4728999", address: "43/3 หมู่ 1 ต.ทรัพย์ทวี อ.บ้านนาเดิม 84240" },
  { id: 922, latitude: 8.9644106, longitude: 99.2939391, name: "วิรัตน์ปาล์มทอง", district: "บ้านนาเดิม", type: "yard", phone: "083-3903513", address: "57/1 หมู่ 5 ต.ท่าเรือ อ.บ้านนาเดิม 84240" },
  { id: 923, latitude: 8.87438, longitude: 99.29790, name: "บจ.เดลต้าวู้ด", district: "บ้านนาเดิม", type: "yard", phone: "081-1446852", address: "419/12 หมู่ 2 ต.บ้านนา อ.บ้านนาเดิม 84240" },
  { id: 924, latitude: 8.9053500, longitude: 99.2823610, name: "ปณิสราปาล์มน้ำมัน", district: "บ้านนาเดิม", type: "yard", phone: "091-2108653", address: "37/9 หมู่ 7 ต.นาใต้ อ.บ้านนาเดิม 84240" },
  { id: 925, latitude: 8.929717, longitude: 99.249, name: "ทรัพย์ทวีปาล์ม", district: "บ้านนาเดิม", type: "yard", phone: "089-4753999", address: "83/4 หมู่ 1 ถ.ท่าเรือ-เขาตอก ต.ทรัพย์ทวี อ.บ้านนาเดิม 84240" },
  { id: 926, latitude: 8.94741, longitude: 99.28064, name: "ไชยมงคลปาล์ม", district: "บ้านนาเดิม", type: "yard", phone: "084-1412069", address: "99/1 หมู่ 4 ถ.เซาท์เทิร์น ต.ท่าเรือ อ.บ้านนาเดิม 84240" },
  { id: 927, latitude: 8.87533, longitude: 99.27419, name: "ฟ้าใสปาล์ม & วู้ดชิพ", district: "บ้านนาเดิม", type: "yard", phone: "083-5945554", address: "74 หมู่ 5 ถ.บ้านนาเดิม-เคียนซา ต.บ้านนา อ.บ้านนาเดิม 84240" },
  { id: 928, latitude: 8.889014, longitude: 99.222969, name: "ลานภาณุพงศ์-ภาณุวิชญ์ปาล์มทอง", district: "บ้านนาเดิม", type: "yard", phone: "083-6441997", address: "99/1 หมู่ 4 ถ.สาย 44 เซาท์เทิร์น ต.ทรัพย์ทวี อ.บ้านนาเดิม 84240" },
  { id: 931, latitude: 8.87291, longitude: 99.29797, name: "วสุรัตน์", district: "บ้านนาเดิม", type: "yard", phone: "081-8944156", address: "442/2 หมู่ 2 ถ.สายเอเซีย ต.บ้านนา อ.บ้านนาเดิม 84240" },
  { id: 932, latitude: 8.897173, longitude: 99.285027, name: "เรวดีค้าไม้", district: "บ้านนาเดิม", type: "yard", phone: "063-6064025", address: "6/4 หมู่ 5 ต.บ้านนา อ.บ้านนาเดิม 84240" },
  { id: 933, latitude: 8.95716, longitude: 99.27693, name: "อันดามันปาล์ม", district: "บ้านนาเดิม", type: "yard", address: "3/7 หมู่ 5 ถ.ออกนาใต้ ต.ท่าเรือ อ.บ้านนาเดิม 84240" },
  { id: 934, latitude: 8.949003, longitude: 99.242278, name: "ลำพูนทองปาล์ม", district: "บ้านนาเดิม", type: "yard", phone: "094-5797742", address: "49/1 หมู่ 3 ต.ท่าเรือ อ.บ้านนาเดิม 84240" },
  { id: 935, latitude: 8.913138, longitude: 99.233457, name: "ปณิสราปาล์มน้ำมัน (สาขา2)", district: "บ้านนาเดิม", type: "yard", phone: "091-0108653", address: "19/1 หมู่ 3 ต.ทรัพย์ทวี อ.บ้านนาเดิม 84240" },
  { id: 936, latitude: 8.91801, longitude: 99.325138, name: "จินดาพรปาล์ม & ลานน้องปาน", district: "บ้านนาเดิม", type: "yard", phone: "086-2694461", address: "หมู่ 2 ต.นาใต้ อ.บ้านนาเดิม 84240" },
  // บ้านนาสาร district yards
  { id: 951, latitude: 8.681136, longitude: 99.322324, name: "ศักดิ์ชายปาล์ม (สาขาควนมหาชัย)", district: "บ้านนาสาร", type: "yard", phone: "084-8405492", address: "หมู่ 1 ต.ควนศรี อ.บ้านนาสาร 84270" },
  { id: 952, latitude: 8.702353, longitude: 99.296244, name: "ควนพรุพรีปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "081-3305639", address: "34/1 หมู่ 7 ต.ควนศรี อ.บ้านนาสาร 84270" },
  { id: 953, latitude: 8.68021, longitude: 99.33565, name: "เอเชียปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "089-5939176", address: "96/8 หมู่ 5 ถ.เอเซีย ต.พรุพรี อ.บ้านนาสาร 84120" },
  { id: 954, latitude: 8.70924, longitude: 99.33401, name: "บมจ.เนชั่นแนล เพาเวอร์ ซัพพลาย", district: "บ้านนาสาร", type: "yard", phone: "098-7376380", address: "319/1 หมู่ 2 ถ.สายเอเซีย ต.ควนศรี อ.บ้านนาสาร 84270" },
  { id: 955, latitude: 8.77894, longitude: 99.31865, name: "ทรัพย์วนาชัยปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "081-4770234", address: "3 หมู่ 1 ต.น้ำพุ อ.บ้านนาสาร" },
  { id: 956, latitude: 8.69435, longitude: 99.37087, name: "ลานเทโชคสถาพร", district: "บ้านนาสาร", type: "yard", phone: "081-5370456", address: "106/8 หมู่ 6 ถ.บ้านนาสาร-เวียงสระ ต.พรุพรี อ.บ้านนาสาร 84120" },
  { id: 957, latitude: 8.70398, longitude: 99.33894, name: "พรุพรีปาล์มทอง", district: "บ้านนาสาร", type: "yard", phone: "086-2661812", address: "363/7 หมู่ 2 ต.พรุพรี อ.บ้านนาสาร 84120" },
  { id: 958, latitude: 8.706667, longitude: 99.297111, name: "เอกลานปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "095-4193482", address: "62/1 หมู่ 7 ต.ควนศรี อ.บ้านนาสาร 84120" },
  { id: 959, latitude: 8.831587, longitude: 99.371811, name: "ลานเทน้ำยางสดคลองหา", district: "บ้านนาสาร", type: "yard", phone: "083-1051788", address: "46/11 ถ.คลองหา ต.นาสาร อ.บ้านนาสาร 84120" },
  { id: 960, latitude: 8.86562, longitude: 99.37385, name: "ควนสุบรรณปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "077-922814", address: "100/6 หมู่ 4 ต.ควนสุบรรณ อ.บ้านนาสาร 84240" },
  { id: 961, latitude: 8.92391, longitude: 99.38395, name: "ลานทุ่งเตาปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "086-9469188", address: "84/2 หมู่ 5 ถ.ทุ่งเตา-บ้านนาเดิม ต.ทุ่งเตา อ.บ้านนาสาร 84120" },
  { id: 963, latitude: 8.74444, longitude: 99.26939, name: "ท่าชีปาล์มทอง (น้องพร-น้องดี)", district: "บ้านนาสาร", type: "yard", phone: "081-0869681", address: "10/1 หมู่ 4 ต.ท่าชี อ.บ้านนาสาร 84120" },
  { id: 964, latitude: 8.79400, longitude: 99.31287, name: "บ้านนาปาล์มทอง 2", district: "บ้านนาสาร", type: "yard", phone: "081-3969981", address: "หมู่ 1 ถ.สายเอเซีย ต.น้ำพุ อ.บ้านนาสาร 84120" },
  { id: 965, latitude: 8.69782, longitude: 99.33455, name: "เวียงสระชีวมวล สาขา 2", district: "บ้านนาสาร", type: "yard", phone: "089-2887816", address: "184 หมู่ 7 ถ.เอเซีย ต.ควนศรี อ.บ้านนาสาร 84270" },
  { id: 968, latitude: 8.96894, longitude: 99.39222, name: "ลานยางนิวัฒน์", district: "บ้านนาสาร", type: "yard", phone: "092-9392459", address: "181/5 ถ.สุราษฎร์-นาสาร ต.ทุ่งเตาใหม่ อ.บ้านนาสาร 84120" },
  { id: 969, latitude: 8.70381, longitude: 99.309612, name: "ธัญณลินปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "077-342709", address: "49/6 หมู่ 7 ต.ควนศรี อ.บ้านนาสาร 84270" },
  { id: 970, latitude: 8.76692, longitude: 99.33046, name: "ศักดิ์ชายปาล์ม สาขา นาสาร1", district: "บ้านนาสาร", type: "yard", phone: "098-7352588", address: "80 ต.นาสาร อ.บ้านนาสาร 84120" },
  { id: 971, latitude: 8.78507, longitude: 99.32547, name: "วังหล้อลานปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "095-0788529", address: "104 หมู่ 7 ต.นาสาร อ.บ้านนาสาร 84120" },
  { id: 972, latitude: 8.71970, longitude: 99.33478, name: "ลานเทศรีทองปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "086-0210900", address: "132/1 หมู่ 2 ถ.สายเอเซีย ต.พรุพรี อ.บ้านนาสาร 84120" },
  { id: 973, latitude: 8.75757, longitude: 99.28860, name: "ป.เจริญผล", district: "บ้านนาสาร", type: "yard", phone: "082-2849916", address: "44/2 หมู่ 1 ต.ท่าชี อ.บ้านนาสาร 84120" },
  { id: 974, latitude: 8.72230, longitude: 99.28867, name: "ลานปาล์มรุ่งโรจน์", district: "บ้านนาสาร", type: "yard", phone: "094-2492678", address: "135/1 หมู่ 4 ถ.ควนศรี ซ.วังใหญ่ ต.ควนศรี อ.บ้านนาสาร 84270" },
  { id: 975, latitude: 8.742101, longitude: 99.269872, name: "ศุภรัตนปาล์มเพชร", district: "บ้านนาสาร", type: "yard", phone: "087-8976698", address: "127/1 หมู่ 4 ต.ท่าชี อ.บ้านนาสาร 84120" },
  { id: 976, latitude: 8.674576, longitude: 99.353675, name: "ศานติปาล์ม", district: "บ้านนาสาร", type: "yard", phone: "091-0108479", address: "116/1 หมู่ 5 ต.พรุพรี อ.บ้านนาสาร 84270" },
  { id: 978, latitude: 8.759821, longitude: 99.292695, name: "ลานปาล์มผู้ใหญ่ติ้ว", district: "บ้านนาสาร", type: "yard", phone: "081-1897708", address: "10/2 หมู่ 1 ต.ท่าชี อ.บ้านนาสาร 84120" },
  { id: 979, latitude: 8.694165, longitude: 99.3685561, name: "บจ.เจเอ็นแอล เจริญผล", district: "บ้านนาสาร", type: "yard", phone: "066-1139938", address: "58 หมู่ 4 ต.พรุพรี อ.บ้านนาสาร 84270" },
  // พนม district yards
  { id: 1001, latitude: 8.7171, longitude: 98.874, name: "ลานเทลัดดาปาล์ม", district: "พนม", type: "yard", phone: "063-0817024", address: "196/1 หมู่ 9 ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1003, latitude: 8.6931963, longitude: 98.8581368, name: "ศักดิ์ชายลานเทปาล์ม-สาขาเขาเขียว", district: "พนม", type: "yard", phone: "080-6937372", address: "หมู่ 12 ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1004, latitude: 8.67431, longitude: 98.82542, name: "ลานเทชุมขุนปาล์ม", district: "พนม", type: "yard", phone: "081-1251956", address: "238 หมู่ 6 ถ.สุราษฎร์-เขาต่อ ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1005, latitude: 8.7283, longitude: 98.79998, name: "ลานปาล์ม เดชทวีพารวย", district: "พนม", type: "yard", phone: "082-8196599", address: "99 หมู่ 4 ถ.สุราษฎร์ธานี-เขาต่อ ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1006, latitude: 8.701617, longitude: 98.7943263, name: "ลานเท สวนแสงจันทร์ (ฟ้ามีตา)", district: "พนม", type: "yard", phone: "080-245193", address: "294 หมู่ 5 ถ.พนม-พังงา ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1007, latitude: 8.87539, longitude: 98.87184, name: "บจ.ซัน ซิตี้ อินเตอร์เนชั่นแนล โฮลดิ้ง", district: "พนม", type: "yard", phone: "077-929347", address: "104 หมู่ 2 ต.ต้นยวน อ.พนม 84250" },
  { id: 1008, latitude: 8.770070, longitude: 98.823590, name: "แสนสุขพืชผล", district: "พนม", type: "yard", phone: "077-398118", address: "201 หมู่ 2 ถ.สุราษฎร์-เขาต่อ ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1009, latitude: 8.707800, longitude: 98.741020, name: "เบญจาปาล์ม 1", district: "พนม", type: "yard", phone: "081-9784988", address: "79 หมู่ 1 ถ.พนม-ทับปุด ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1010, latitude: 8.7873971, longitude: 98.8282171, name: "จักรพรรดิ์ปาล์ม & แสนสุข", district: "พนม", type: "yard", phone: "098-0380824", address: "230 หมู่ 2 ต.คลองชะอุ่น อ.พนม 84230" },
  { id: 1011, latitude: 8.89204, longitude: 98.54789, name: "ลานเทปาล์มเขาสก", district: "พนม", type: "yard", phone: "089-8716993", address: "254 หมู่ 6 ถ.ตะกั่วป่า-สุราษฎร์ ต.คลองสก อ.พนม 84250" },
  { id: 1012, latitude: 8.8237561, longitude: 98.8093165, name: "บจ.กลุ่มสมอทอง (สาขา1) หน่วยงาน 9", district: "พนม", type: "yard", address: "58 หมู่ 2 ต.พนม อ.พนม 84250" },
  { id: 1013, latitude: 8.76312, longitude: 98.87414, name: "แสงแก้วปาล์มทอง", district: "พนม", type: "yard", phone: "085-4748869", address: "หมู่ 5 ต.ต้นยวน อ.พนม 84250" },
  { id: 1015, latitude: 8.7265, longitude: 98.8202, name: "ขุนณรงค์ลานเท", district: "พนม", type: "yard", phone: "092-2681915", address: "221 หมู่ 7 ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1016, latitude: 8.78838, longitude: 98.87031, name: "ลานปาล์มบ้านถ้ำผึ้ง", district: "พนม", type: "yard", phone: "087-9748788", address: "374 หมู่ 5 ถ.บ้านถ้ำผึ้ง ต.ต้นยวน อ.พนม 84250" },
  { id: 1017, latitude: 8.83785, longitude: 98.80744, name: "คงครองรุ่งเรื่อง", district: "พนม", type: "yard", phone: "082-9186186", address: "81 หมู่ 1 ถ.พนม-ทับปุด ต.พนม อ.พนม 84250" },
  { id: 1018, latitude: 8.7436, longitude: 98.7453, name: "ห้าวหาญการเกษตร", district: "พนม", type: "yard", phone: "084-8451829", address: "131 หมู่ 1 ถ.พนม-ทับปุด ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1019, latitude: 8.84559, longitude: 98.86457, name: "ลานเท ป.รุ่งเรืองปาล์ม", district: "พนม", type: "yard", phone: "089-8748443", address: "87 หมู่ 4 ถ.กม.63-ถ้ำผึ้ง ต.ต้นยวน อ.พนม 84250" },
  { id: 1020, latitude: 8.67695, longitude: 98.78491, name: "ลานเทชุมขุนปาล์ม (สาขา 2)", district: "พนม", type: "yard", phone: "082-6597988", address: "241 หมู่ 8 ถ.พนม-เขาศก ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1023, latitude: 8.834, longitude: 98.789, name: "หน่วยงานแสนสุขพืชผล สาขา 2", district: "พนม", type: "yard", phone: "082-4115193", address: "73/2 หมู่ 7 ต.พนม อ.พนม 84250" },
  { id: 1025, latitude: 8.877586, longitude: 98.832282, name: "แสนสุขพืชผล (สาขา พังกาญจน์)", district: "พนม", type: "yard", phone: "088-5851012", address: "13/1 หมู่ 2 ถ.สุราษฎร์-ตะกั่วป่า ต.พังกาญจน์ อ.พนม 84250" },
  { id: 1026, latitude: 8.6901, longitude: 98.8740, name: "แสงตะวันปาล์ม", district: "พนม", type: "yard", phone: "084-7455082", address: "149 หมู่ 12 ถ.พนม-เขาต่อ ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1027, latitude: 8.7533, longitude: 98.7488, name: "หจก.กิจเจริญปาล์ม", district: "พนม", type: "yard", phone: "061-3983591", address: "9/1 หมู่ 1 ถ.พนม-ทับปุด ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1028, latitude: 8.83532, longitude: 98.84000, name: "สมใจปาล์มทอง (พนม)", district: "พนม", type: "yard", phone: "087-8891487", address: "85 หมู่ 13 ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1029, latitude: 8.88741, longitude: 98.88206, name: "ลานปาล์ม กม 61", district: "พนม", type: "yard", phone: "077-39719", address: "196 หมู่ 2 ถ.สุราษฎร์ฯ-ตะกั่วป่า ต.ต้นยวน อ.พนม 84250" },
  { id: 1030, latitude: 8.81882, longitude: 98.86185, name: "คงชนะปาล์ม", district: "พนม", type: "yard", phone: "086-2744449", address: "434 หมู่ 5 ถ.บ้านถ้ำผึ้ง ต.ต้นยวน อ.พนม 84250" },
  { id: 1031, latitude: 8.87952, longitude: 98.86480, name: "วาสนาน้องโตน", district: "พนม", type: "yard", phone: "081-4779902", address: "193 หมู่ 2 ถ.สุราษฎร์-พนม ต.ต้นยวน อ.พนม 84250" },
  { id: 1032, latitude: 8.76838, longitude: 98.95586, name: "ลานเทจำเนียร", district: "พนม", type: "yard", phone: "077-302052", address: "305 หมู่ 8 ถ.พนม-ต้นยวน ต.ต้นยวน อ.พนม 84250" },
  { id: 1033, latitude: 8.8426933, longitude: 98.8353958, name: "เค ดี ปาล์ม", district: "พนม", type: "yard", phone: "090-4871562", address: "2 หมู่ 5 ต.พังกาญจน์ อ.พนม 84250" },
  { id: 1034, latitude: 8.855993, longitude: 98.845198, name: "ลานปาล์มชัยเจริญ", district: "พนม", type: "yard", phone: "081-7340833", address: "100 หมู่ 10 ถ.พนม-นาเหนือ ต.ต้นยวน อ.พนม 84250" },
  { id: 1037, latitude: 8.78304, longitude: 98.79274, name: "ไร่โกมินทร์", district: "พนม", type: "yard", phone: "089-5946155", address: "22 หมู่ 5 ต.พนม อ.พนม 84250" },
  { id: 1038, latitude: 8.708513, longitude: 98.795113, name: "ลานเทยุทธศักดิ์ปาล์ม", district: "พนม", type: "yard", phone: "082-6365256", address: "34 หมู่ 5 ถ.นาเหนือ-พนม ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1039, latitude: 8.698, longitude: 98.718, name: "บจ.กลุ่มสมอทอง สาขาที่ 1 หน่วยงานที่ 10", district: "พนม", type: "yard", phone: "077-951444", address: "136 หมู่ 3 ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1040, latitude: 8.8785, longitude: 98.8329, name: "เค เอ็ม 66", district: "พนม", type: "yard", phone: "077-963289", address: "174 หมู่ 1 ต.พังกาญจน์ อ.พนม 84250" },
  { id: 1041, latitude: 8.79922, longitude: 98.94229, name: "ศักดิ์ชาย ลานเทปาล์ม (สาขาบางโก)", district: "พนม", type: "yard", phone: "086-2802209", address: "46 หมู่ 9 ถ.บ้านตาขุน-ควนกลิ้ง ต.ต้นยวน อ.พนม 84250" },
  { id: 1043, latitude: 8.757381, longitude: 98.752533, name: "ทวีโชค รับซื้อไม้ยางพารา", district: "พนม", type: "yard", phone: "082-2416995", address: "19/1 หมู่ 1 ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1044, latitude: 8.67646, longitude: 98.70273, name: "ลานเทผู้ใหญ่หมู", district: "พนม", type: "yard", phone: "083-5022018", address: "2 หมู่ 5 ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1046, latitude: 8.721847, longitude: 98.834378, name: "บุญนำกำนันเล็ก (เขาหินแป้ง)", district: "พนม", type: "yard", phone: "080-6937372", address: "263 หมู่ 7 ถ.พนม-เขาต่อ ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1047, latitude: 8.846507, longitude: 98.747864, name: "ถาวรการเกษตร", district: "พนม", type: "yard", phone: "093-5811651", address: "118/3 หมู่ 9 ต.พนม อ.พนม 84250" },
  { id: 1048, latitude: 8.6899, longitude: 98.83974, name: "บจ.มนะพณโลจีสติกส์", district: "พนม", type: "yard", phone: "081-0777741", address: "261 หมู่ 11 ถ.บ้านควนพน ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1049, latitude: 8.8852038, longitude: 98.6522175, name: "นิลเพชรปาล์ม 2", district: "พนม", type: "yard", address: "133/1 หมู่ 7 ต.คลองสก อ.พนม 84250" },
  { id: 1052, latitude: 8.809669, longitude: 98.804749, name: "เบญจาปาล์ม 2", district: "พนม", type: "yard", phone: "081-9784988", address: "หมู่ 4 ถ.พนม-ทับปุด ต.พนม อ.พนม 84250" },
  { id: 1053, latitude: 8.687028, longitude: 98.840528, name: "ศักดิ์ชายลานปาล์ม (สาขา คลองชะอุ่น)", district: "พนม", type: "yard", phone: "080-6937372", address: "260 หมู่ 11 ถ.พนม-เขาศก ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1054, latitude: 8.82371, longitude: 98.80933, name: "บจ.กลุ่มสมอทอง สาขาที่ 1 หน่วยงานที่ 9 พนม", district: "พนม", type: "yard", phone: "094-7453645", address: "58 หมู่ 2 ต.พนม อ.พนม 84250" },
  { id: 1055, latitude: 8.72644, longitude: 98.87869, name: "ลานเทบุญนำ (สาขา 3) บ้านป่าตง", district: "พนม", type: "yard", phone: "089-9096800", address: "45 หมู่ 12 ต.ต้นยวน อ.พนม 84250" },
  { id: 1056, latitude: 8.8338, longitude: 98.8399, name: "บจ. สมอทองปาล์ม 2 สาขา 1 หน่วยงาน 5", district: "พนม", type: "yard", phone: "081-8519450", address: "44/1 หมู่ 1 ต.คลองชะอุ่น อ.พนม 84250" },
  { id: 1057, latitude: 8.86574, longitude: 98.71259, name: "คลองศกลานปาล์ม", district: "พนม", type: "yard", phone: "086-0133207", address: "115 หมู่ 3 ถ.ตะกั่วป่า-สุราษฎร์ ต.คลองสก อ.พนม 84250" },
  { id: 1058, latitude: 8.892241, longitude: 98.657425, name: "ลานเทปาล์ม กม.92", district: "พนม", type: "yard", phone: "082-2773496", address: "387 หมู่ 7 ถ.สุราษฎร์-ตะกั่วป่า ต.คลองสก อ.พนม 84250" },
  { id: 1059, latitude: 8.851233, longitude: 98.905495, name: "หจก.ไผ่ทองธุรกิจ", district: "พนม", type: "yard", phone: "093-7602341", address: "หมู่ 7 ถ.ต้นยวน-เคียนซา ต.ต้นยวน อ.พนม 84250" },
  { id: 1060, latitude: 8.763535, longitude: 98.94458, name: "ลานเทผู้ใหญ่สมพรปาล์ม", district: "พนม", type: "yard", phone: "077-302084", address: "245/1 หมู่ 11 ต.ต้นยวน อ.พนม 84250" },
  { id: 1061, latitude: 8.79694, longitude: 98.797565, name: "นกเขาการยาง&ปาล์ม", district: "พนม", type: "yard", phone: "096-3340328", address: "22 หมู่ 6 ต.พนม อ.พนม 84250" },
  { id: 1062, latitude: 8.819644, longitude: 98.809837, name: "สมใจปาล์มทอง (พนม2)", district: "พนม", type: "yard", phone: "089-9725514", address: "31/1 หมู่ 13 ถ.สุราษฎร์ฯ-ทับปุด ต.พนม อ.พนม 84250" },
  { id: 1063, latitude: 8.801738, longitude: 98.801036, name: "ทวีเดชเกษตรปาล์ม สาขา 5", district: "พนม", type: "yard", phone: "089-6526671", address: "158 หมู่ 4 ต.พนม อ.พนม 84250" },
  { id: 1065, latitude: 8.877582, longitude: 98.862289, name: "ร้านแสงแก้วปาล์มทอง", district: "พนม", type: "yard", phone: "081-0876230", address: "32/1 หมู่ 2 ต.ต้นยวน อ.พนม 84250" },
  { id: 1066, latitude: 8.84134, longitude: 98.7702, name: "ศรีสาครเจริญ เกษตรภัณฑ์", district: "พนม", type: "yard", phone: "086-6859188", address: "119 หมู่ 8 ต.พนม อ.พนม 84250" },
  { id: 1067, latitude: 8.877571, longitude: 98.832377, name: "สรรชัยปาล์มทอง", district: "พนม", type: "yard", phone: "092-9869732", address: "13/1 หมู่ 2 ต.พังกาญจน์ อ.พนม 84250" },
  { id: 1068, latitude: 8.810717, longitude: 98.805908, name: "ลานปาล์มสี่พี่น้อง", district: "พนม", type: "yard", phone: "085-7827618", address: "หมู่ 3 ต.พนม อ.พนม 84250" },
  { id: 1069, latitude: 8.71174, longitude: 98.72648, name: "ลานเทกำนันปรีชา", district: "พนม", type: "yard", address: "หมู่ 4 ต.พลูเถื่อน อ.พนม 84250" },
  { id: 1070, latitude: 8.7577412, longitude: 98.9619165, name: "ลานเท พงศพัศ", district: "พนม", type: "yard", phone: "093-6787980", address: "227 หมู่ 8 ต.ต้นยวน อ.พนม 84210" },
  { id: 1071, latitude: 8.772972, longitude: 98.784556, name: "ลานเทวิษณุปาล์ม สาขา 2", district: "พนม", type: "yard", phone: "088-4462892", address: "226 หมู่ 5 ต.พนม อ.พนม 84250" },
  { id: 1072, latitude: 8.7935, longitude: 98.956, name: "น้องไก่ & น้องเจมส์ การยาง", district: "พนม", type: "yard", phone: "093-6524828", address: "489 หมู่ 8 ต.ต้นยวน อ.พนม 84250" },
  // พระแสง district yards
  { id: 1101, latitude: 8.5466, longitude: 99.0638, name: "สหกรณ์นิคมสร้างตนเองพระแสง", district: "พระแสง", type: "yard", phone: "081-4769060", address: "หมู่ 5 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1102, latitude: 8.569, longitude: 99.194, name: "บจ.ป.พาณิชย์รุ่งเรือง ปาล์มออยล์", district: "พระแสง", type: "yard", phone: "087-2773171", address: "57 หมู่ 1 ต.สาคู อ.พระแสง 84210" },
  { id: 1103, latitude: 8.627779, longitude: 99.239438, name: "พิศาลปาล์ม", district: "พระแสง", type: "yard", phone: "077-280726", address: "117 หมู่ 5 ถ.ควนสามัคคี-พระแสง ต.อิปัน อ.พระแสง 84210" },
  { id: 1104, latitude: 8.407, longitude: 99.23, name: "ลดา ลานเท", district: "พระแสง", type: "yard", phone: "085-5732247", address: "105/9 หมู่ 4 ต.สินเจริญ อ.พระแสง 84120" },
  { id: 1106, latitude: 8.648967, longitude: 98.902397, name: "บุญเลิศปาล์ม", district: "พระแสง", type: "yard", phone: "081-8491375", address: "124/1 หมู่ 14 ถ.บางสวรรค์-ปลายพระยา ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1107, latitude: 8.56125, longitude: 99.14295, name: "ลิ้มวงศ์ 3000", district: "พระแสง", type: "yard", phone: "089-5891170", address: "28/6 หมู่ 1 ถ.อ่าวลึก-พะแสง ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1108, latitude: 8.58491, longitude: 99.052262, name: "หจก.ประไพ กรุ๊ป", district: "พระแสง", type: "yard", phone: "081-2711736", address: "3/3 หมู่ 4 ถ.พระแสง-อ่าวลึก ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1109, latitude: 8.40227, longitude: 99.21157, name: "ลานปาล์ม หงษ์ทอง เจริญทรัพย์", district: "พระแสง", type: "yard", address: "28/1 หมู่ 5 ต.สินเจริญ อ.พระแสง 84210" },
  { id: 1110, latitude: 8.4779, longitude: 99.233, name: "สมพรปาล์ม", district: "พระแสง", type: "yard", phone: "081-9687488", address: "59 หมู่ 6 ถ.พระแสง-ทุ่งใหญ่ ต.สินปุน อ.พระแสง 84210" },
  { id: 1111, latitude: 8.58207, longitude: 99.05887, name: "ลานเทสหกรณ์ปาล์มต้นไทร", district: "พระแสง", type: "yard", phone: "081-1018028", address: "39/1 หมู่ 4 ถ.พระแสง-บางสวรรค์ ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1112, latitude: 8.4622685, longitude: 99.1746496, name: "ลานเทปาล์ม พีทรัพย์", district: "พระแสง", type: "yard", phone: "095-4212332", address: "52/2 หมู่ 11 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1113, latitude: 8.6292922, longitude: 98.965576, name: "บจ.บางสวรรค์น้ำมันปาล์ม", district: "พระแสง", type: "yard", phone: "077-365042", address: "111 หมู่ 5 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1114, latitude: 8.63955, longitude: 99.08027, name: "บ้านราษฎร์ปาล์ม", district: "พระแสง", type: "yard", phone: "098-9968878", address: "33/3 หมู่ 6 ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1115, latitude: 8.55527, longitude: 98.9895, name: "จิตราปาล์มทอง (สาขา2)", district: "พระแสง", type: "yard", phone: "095-4192218", address: "หมู่ 7 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1116, latitude: 8.6546206, longitude: 98.9614535, name: "สุนทรปาล์ม", district: "พระแสง", type: "yard", phone: "081-9798302", address: "240 หมู่ 8 ถ.พระแสง-ปลายพระยา ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1117, latitude: 8.50393, longitude: 99.25731, name: "เมรัยลานเท", district: "พระแสง", type: "yard", phone: "089-9093482", address: "78/3 หมู่ 5 ถ.พระแสง-ทุ่งใหญ่ ต.สินปุน อ.พระแสง 84210" },
  { id: 1118, latitude: 8.63936, longitude: 99.17534, name: "ฤทธิ์เดชปาล์ม", district: "พระแสง", type: "yard", phone: "090-9707984", address: "23/3 หมู่ 7 ถ.ควนสามัคคี-บางใหญ่ ต.สาคู อ.พระแสง 84210" },
  { id: 1119, latitude: 8.45346, longitude: 99.16025, name: "น้องลานปาล์ม", district: "พระแสง", type: "yard", phone: "099-6325973", address: "73 หมู่ 11 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1120, latitude: 8.641, longitude: 99.039, name: "ทรัพย์สุภารัตน์รุ่งเรืองลานเท", district: "พระแสง", type: "yard", phone: "089-6353539", address: "16/11 หมู่ 10 ต.บางสวรรค์ อ.พระแสง" },
  { id: 1121, latitude: 8.56987, longitude: 99.12221, name: "ไสวปาล์ม", district: "พระแสง", type: "yard", phone: "093-2896951", address: "55/3 หมู่ 3 ถ.พระแสง-ชัยบุรี ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1122, latitude: 8.470615, longitude: 99.173394, name: "ผู้ใหญ่นึก ลานเทปาล์ม", district: "พระแสง", type: "yard", phone: "088-4424797", address: "38/2 หมู่ 11 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1123, latitude: 8.8796, longitude: 99.4467, name: "สวนทุเรียน แม่แอ๋ว", district: "พระแสง", type: "yard", phone: "081-2293019", address: "78 หมู่ 4 ต.สินปุน อ.พระแสง 84210" },
  { id: 1124, latitude: 8.58508, longitude: 99.08087, name: "ท๊อป ปาล์มประตูพลิก", district: "พระแสง", type: "yard", phone: "081-3703502", address: "57/2 หมู่ 2 ถ.พระแสง-ปลายพระยา ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1125, latitude: 8.668444, longitude: 98.971422, name: "พูนศักดิ์การค้า", district: "พระแสง", type: "yard", phone: "089-0109201", address: "137/4 หมู่ 5 ซ.บ้านน้ำผุด ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1126, latitude: 8.424217, longitude: 99.16565, name: "ผู้ใหญ่โมทย์ลานเท", district: "พระแสง", type: "yard", phone: "063-6871002", address: "77/1 หมู่ 9 ต.สินปุน อ.พระแสง 84210" },
  { id: 1127, latitude: 8.579641, longitude: 99.017487, name: "หจก.พาขวัญกรุ๊ป", district: "พระแสง", type: "yard", phone: "086-2823581", address: "18/2 หมู่ 7 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1128, latitude: 8.8401, longitude: 98.9994, name: "ลานจิราภรณ์", district: "พระแสง", type: "yard", phone: "095-4075268", address: "64 หมู่ 9 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1129, latitude: 8.61386, longitude: 98.96078, name: "เด่นชัย ลานไม้", district: "พระแสง", type: "yard", phone: "085-4721631", address: "2/16 หมู่ 4 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1130, latitude: 8.493472, longitude: 99.217, name: "ธ.ธนัท", district: "พระแสง", type: "yard", phone: "091-0188959", address: "13/7 หมู่ 8 ต.สินปุน อ.พระแสง" },
  { id: 1131, latitude: 8.58056, longitude: 99.06825, name: "ลานเทไทรโสภาปาล์ม", district: "พระแสง", type: "yard", phone: "087-2676994", address: "135 หมู่ 3 ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1133, latitude: 8.502, longitude: 99.199, name: "ลานเทชัยปาล์มทอง", district: "พระแสง", type: "yard", phone: "092-5939345", address: "หมู่ 12 ต.อิปัน อ.พระแสง" },
  { id: 1134, latitude: 8.535292, longitude: 99.1825291, name: "บจ.เจ.ยู.เอ็น.เอ็กซ์เพรส", district: "พระแสง", type: "yard", phone: "098-0143063", address: "48 หมู่ 2 ต.สาคู อ.พระแสง 84210" },
  { id: 1135, latitude: 8.6504, longitude: 99.068, name: "ลานเท อันดา ปาล์มทอง", district: "พระแสง", type: "yard", phone: "096-0381133", address: "43/4 หมู่ 6 ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1137, latitude: 8.654636, longitude: 98.961556, name: "สุนทรลานปาล์ม", district: "พระแสง", type: "yard", phone: "081-9798302", address: "240 หมู่ 8 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1138, latitude: 8.6033, longitude: 99.0083, name: "สุขสวัสดิ์การยาง", district: "พระแสง", type: "yard", phone: "081-9681130", address: "76/2 หมู่ 1 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1139, latitude: 8.5294, longitude: 98.9887, name: "ลานเทปาล์มสองพี่น้อง", district: "พระแสง", type: "yard", phone: "062-0855964", address: "96 หมู่ 12 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1140, latitude: 8.62599, longitude: 98.95891, name: "พลพิชัยปาล์ม", district: "พระแสง", type: "yard", phone: "088-7512401", address: "49/4 หมู่ 4 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1141, latitude: 8.60402, longitude: 99.00680, name: "ลานเทลุงสุน", district: "พระแสง", type: "yard", phone: "089-9704566", address: "69/4 หมู่ 1 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1142, latitude: 8.657478, longitude: 98.990311, name: "โชกุนปาล์ม", district: "พระแสง", type: "yard", phone: "081-2711736", address: "119 หมู่ 2 ถ.เคียนซา-บางสวรรค์ ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1145, latitude: 8.598305, longitude: 98.967366, name: "ลานปาล์มครูชาติ", district: "พระแสง", type: "yard", phone: "086-2810986", address: "281 หมู่ 5 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1146, latitude: 8.59372, longitude: 99.35613, name: "ลานเทณัฐวุฒิปาล์ม", district: "พระแสง", type: "yard", phone: "086-2827891", address: "16/2 หมู่ 6 ต.สาคู อ.พระแสง 84120" },
  { id: 1148, latitude: 8.54758, longitude: 98.97811, name: "ลานเทในเขื่อนปาล์ม", district: "พระแสง", type: "yard", phone: "084-8452384", address: "4/1 หมู่ 12 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1149, latitude: 8.50455, longitude: 99.17482, name: "ไสท้อนลานเท", district: "พระแสง", type: "yard", phone: "085-2525549", address: "80/6 หมู่ 6 ถ.พระแสง-ชัยบุรี ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1150, latitude: 8.67487, longitude: 98.97479, name: "ช.อ่างน้ำผุดซื้อไม้", district: "พระแสง", type: "yard", phone: "087-2803751", address: "93 หมู่ 13 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1151, latitude: 8.62569, longitude: 98.93291, name: "บจ.สหอุตสาหกรรมน้ำมันปาล์ม", district: "พระแสง", type: "yard", phone: "075-621917", address: "157 หมู่ 6 ถ.ปลายพระยา-พระแสง ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1152, latitude: 8.5471, longitude: 99.06372, name: "สหกรณ์การเกษตรนิคมสร้างตนเองพระแสง จำกัด", district: "พระแสง", type: "yard", phone: "080-8848422", address: "หมู่ 5 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1153, latitude: 8.64237, longitude: 99.03229, name: "ลานเทมหาชน", district: "พระแสง", type: "yard", phone: "095-4289882", address: "208 หมู่ 10 ถ.กระบี่-ขนอม ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1154, latitude: 8.516026, longitude: 99.227252, name: "พงพานิช", district: "พระแสง", type: "yard", phone: "080-6986341", address: "130 หมู่ 4 ต.สินปุน อ.พระแสง 84210" },
  { id: 1155, latitude: 8.372585, longitude: 99.229259, name: "สมพร ปาล์ม 2", district: "พระแสง", type: "yard", phone: "081-8678079", address: "99/2 หมู่ 6 ต.สินปุน อ.พระแสง 84210" },
  { id: 1156, latitude: 8.5359459, longitude: 99.2289276, name: "บจ.ปาล์มทองคำ", district: "พระแสง", type: "yard", phone: "080-4481559", address: "111/1 หมู่ 4 ถ.ทุ่งใหญ่-พระแสง ต.สินปุน อ.พระแสง 84210" },
  { id: 1157, latitude: 8.584756, longitude: 99.0783397, name: "ไสท้อนลานเท (สาขา 2)", district: "พระแสง", type: "yard", phone: "085-2525549", address: "15/3 หมู่ 2 ถ.บางสวรรค์-ควนสว่าง ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1158, latitude: 8.58020, longitude: 99.09587, name: "พนิดาปาล์ม", district: "พระแสง", type: "yard", phone: "084-7606928", address: "24/1 หมู่ 1 ถ.อ่าวลึก-พระแสง ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1159, latitude: 8.45631, longitude: 99.17247, name: "ณ นครปาล์ม", district: "พระแสง", type: "yard", phone: "081-3267261", address: "82/2 หมู่ 11 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1160, latitude: 8.4552, longitude: 99.2267, name: "ร้านบุษยา การยาง", district: "พระแสง", type: "yard", phone: "089-9734818", address: "99/2 หมู่ 3 ถ.ทุ่งใหญ่-พระแสง ต.สินเจริญ อ.พระแสง 84210" },
  { id: 1161, latitude: 8.58020, longitude: 99.09855, name: "ไชยรัตน์ลานปาล์ม", district: "พระแสง", type: "yard", phone: "081-5380733", address: "47 หมู่ 1 ถ.บางสวรรค์-ควนสว่าง ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1162, latitude: 8.422630, longitude: 99.233139, name: "ลานเทปักธงชัย", district: "พระแสง", type: "yard", phone: "087-2822683", address: "22/19 หมู่ 4 ต.สินเจริญ อ.พระแสง 84210" },
  { id: 1163, latitude: 8.573829, longitude: 99.237817, name: "สหกรณ์การเกษตรพระแสง จำกัด", district: "พระแสง", type: "yard", phone: "081-5350076", address: "13/13 หมู่ 1 ต.อิปัน อ.พระแสง 84210" },
  { id: 1164, latitude: 8.56019, longitude: 99.15405, name: "ชัยรัตน์ปาล์ม แอนด์ รับเบอร์", district: "พระแสง", type: "yard", phone: "089-8934855", address: "105/1 หมู่ 4 ถ.อ่าวลึก-พระแสง ต.สาคู อ.พระแสง 84210" },
  { id: 1165, latitude: 8.67865, longitude: 98.975519, name: "อ.การช่าง บ้านอ่างน้ำผุด ลานเทปาล์ม", district: "พระแสง", type: "yard", phone: "098-0707340", address: "89 หมู่ 13 ต.บางสวรรค์ อ.พระแสง" },
  { id: 1166, latitude: 8.60242, longitude: 99.01536, name: "ยงชัยสัจจา", district: "พระแสง", type: "yard", phone: "081-9582056", address: "หมู่ 1 ถ.อ่าวลึก-พระแสง ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1168, latitude: 8.559143, longitude: 99.168932, name: "สาคูปาล์ม(2016)", district: "พระแสง", type: "yard", phone: "081-1911135", address: "14/4 หมู่ 3 ถ.ควนสว่าง-พระแสง ต.สาคู อ.พระแสง 84210" },
  { id: 1169, latitude: 8.65992, longitude: 98.96361, name: "ลานเทศุภนัฐปาล์ม", district: "พระแสง", type: "yard", phone: "086-2673562", address: "116/7 หมู่ 6 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1170, latitude: 8.52823, longitude: 98.98054, name: "จิตราปาล์มทอง", district: "พระแสง", type: "yard", phone: "095-0151636", address: "138/2 หมู่ 12 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1171, latitude: 8.58496, longitude: 99.05232, name: "พ.ประไพปาล์มออยล์", district: "พระแสง", type: "yard", phone: "081-2711736", address: "3/3 หมู่ 4 ต.ไทรโสภา อ.พระแสง 84210" },
  { id: 1172, latitude: 8.46056, longitude: 99.12203, name: "อดิเรก ปาล์มทองคำ", district: "พระแสง", type: "yard", phone: "086-2805744", address: "145 หมู่ 12 ต.อิปัน อ.พระแสง 84210" },
  { id: 1173, latitude: 8.604, longitude: 99.16509, name: "ห้วยทรายขาวปาล์ม", district: "พระแสง", type: "yard", phone: "081-0877014", address: "61 หมู่ 6 ต.สาคู อ.พระแสง 84210" },
  { id: 1174, latitude: 8.629805, longitude: 99.10842, name: "ศรีเจริญปาล์ม", district: "พระแสง", type: "yard", phone: "081-0835662", address: "67/4 หมู่ 7 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1175, latitude: 8.607932, longitude: 99.122897, name: "อนิรุจน์ลานเทปาล์ม สาขา 3", district: "พระแสง", type: "yard", phone: "098-0719584", address: "31/4 หมู่ 7 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1176, latitude: 8.635534, longitude: 99.150377, name: "อนิรุจน์ลานเทปาล์ม", district: "พระแสง", type: "yard", phone: "092-1263164", address: "20/5 หมู่ 6 ต.สาคู อ.พระแสง 84210" },
  { id: 1178, latitude: 8.56425, longitude: 99.11559, name: "ถาวรปาล์ม", district: "พระแสง", type: "yard", address: "34/5 หมู่ 3 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1179, latitude: 8.4787, longitude: 99.2614, name: "สินเจริญปาล์มทอง", district: "พระแสง", type: "yard", phone: "080-6490386", address: "35/5 หมู่ 1 ต.สินเจริญ อ.พระแสง 84210" },
  { id: 1180, latitude: 8.53, longitude: 99.066, name: "บจ.ปาล์มน้ำมันธรรมชาติ", district: "พระแสง", type: "yard", phone: "077-278600", address: "2 หมู่ 9 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1181, latitude: 8.543, longitude: 99.066, name: "นัฐพงษ์ปาล์ม", district: "พระแสง", type: "yard", phone: "081-9561692", address: "285 หมู่ 5 ต.ไทรขึง อ.พระแสง 84210" },
  { id: 1182, latitude: 8.6726298, longitude: 98.9741195, name: "ลานเท บุญช่วย", district: "พระแสง", type: "yard", phone: "093-6821714", address: "14/2 หมู่ 13 ต.บางสวรรค์ อ.พระแสง" },
  { id: 1183, latitude: 8.63279, longitude: 99.14893, name: "ณรงศักดิ์ ลานเทปาล์ม", district: "พระแสง", type: "yard", address: "54/5 หมู่ 6 ต.สาคู อ.พระแสง 84210" },
  { id: 1184, latitude: 8.530426, longitude: 99.215527, name: "บางไผ่ลานเท", district: "พระแสง", type: "yard", phone: "086-2763323", address: "19/2 หมู่ 3 ต.สินปุน อ.พระแสง 84210" },
  { id: 1185, latitude: 8.5675804, longitude: 99.0040476, name: "ลานเทผู้ใหญ่วิรัตน์", district: "พระแสง", type: "yard", phone: "086-2721807", address: "29 หมู่ 7 ต.บางสวรรค์ อ.พระแสง 84210" },
  { id: 1186, latitude: 8.62734, longitude: 99.2442, name: "เอลิน ปาล์ม", district: "พระแสง", type: "yard", phone: "062-2048441", address: "301 หมู่ 5 ต.อิปัน อ.พระแสง 84210" },
  { id: 1188, latitude: 8.3458, longitude: 99.23561, name: "วัชรินทร์ ทวีทรัพย์", district: "พระแสง", type: "yard", phone: "086-2762550", address: "122 หมู่ 10 ต.สินเจริญ อ.พระแสง 84120" },
  { id: 1189, latitude: 8.30811, longitude: 99.29516, name: "อินทองเจริญทรัพย์", district: "พระแสง", type: "yard", phone: "080-8642166", address: "45/1 หมู่ 8 ต.สินเจริญ อ.พระแสง 84210" },
  { id: 1190, latitude: 8.619348, longitude: 99.2555, name: "ลานเท ปาล์มทองมาก", district: "พระแสง", type: "yard", phone: "063-0583381", address: "2 หมู่ 5 ต.อิปัน อ.พระแสง 84210" },
  // พุนพิน district yards
  { id: 1201, latitude: 9.1627937, longitude: 99.0658702, name: "เล็กลานปาล์ม", district: "พุนพิน", type: "yard", phone: "081-8944695", address: "หมู่ 11 ต.บางงอน อ.พุนพิน 84130" },
  { id: 1202, latitude: 9.07274, longitude: 99.08051, name: "ลานเทปาล์มทองบ้านปึก", district: "พุนพิน", type: "yard", phone: "081-1172099", address: "74/1 หมู่ 1 ต.บางงอน อ.พุนพิน 84130" },
  { id: 1203, latitude: 9.174911, longitude: 99.2332259, name: "บจ.พี.ซี.ปาล์ม (2550) (ลีเล็ด)", district: "พุนพิน", type: "yard", phone: "061-1743095", address: "108/4 หมู่ 6 ต.ลีเล็ด อ.พุนพิน 84130" },
  { id: 1204, latitude: 9.07844, longitude: 99.06292, name: "บางงอนธุรกิจ", district: "พุนพิน", type: "yard", phone: "096-9462963", address: "68 หมู่ 2 ถ.หนองไทร-คีรีรัฐนิคม ต.บางงอน อ.พุนพิน 84130" },
  { id: 1205, latitude: 8.950842, longitude: 99.161065, name: "อันดามันปาล์ม (พุนพิน)", district: "พุนพิน", type: "yard", phone: "089-7263648", address: "83/2 หมู่ 1 ถ.เคียนซา-ท่าโรงช้าง ต.กรูด อ.พุนพิน 84130" },
  { id: 1206, latitude: 9.057978, longitude: 99.147483, name: "นาค้อเจริญปาล์ม", district: "พุนพิน", type: "yard", phone: "081-8042091", address: "29/1 หมู่ 1 ถ.บ่อกรัง-หนองจอก ต.ท่าสะท้อน อ.พุนพิน 84130" },
  { id: 1207, latitude: 9.04032, longitude: 99.08354, name: "ลานเทปาล์ม กม.29", district: "พุนพิน", type: "yard", phone: "081-6151111", address: "59/5 หมู่ 2 ถ.สุราษฎร์ธานี-ตะกั่วป่า ต.บางเดือน อ.พุนพิน 84130" },
  { id: 1208, latitude: 8.90428, longitude: 99.14853, name: "บจ.ดับพลิว.เอ็น.เอส พาราวู้ด", district: "พุนพิน", type: "yard", phone: "081-9583778", address: "2/9 หมู่ 3 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1209, latitude: 9.01232, longitude: 99.17228, name: "ลานควนไทรปาล์ม", district: "พุนพิน", type: "yard", phone: "086-2823581", address: "9/2 หมู่ 5 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1210, latitude: 8.958, longitude: 99.165, name: "สส.รุ่งเรืองปาล์ม", district: "พุนพิน", type: "yard", phone: "083-6358555", address: "121/2 หมู่ 1 ถ.กม.19-เคียนซา ต.กรูด อ.พุนพิน 84130" },
  { id: 1211, latitude: 9.07690, longitude: 99.26160, name: "ลานปาล์มบัลลังค์ทองปาล์ม", district: "พุนพิน", type: "yard", phone: "085-2280827", address: "30/1 หมู่ 4 ถ.สุราษฎร์ธานี-ตะกั่วป่า ต.เขาหัวควาย อ.พุนพิน 84130" },
  { id: 1212, latitude: 9.08402, longitude: 99.1658, name: "ลานเทปาล์มทอง(น้ำรอบ)", district: "พุนพิน", type: "yard", phone: "087-2779456", address: "17/4 หมู่ 2 ถ.พุนพิน-คีรีรัฐนิคม ต.หนองไทร อ.พุนพิน 84130" },
  { id: 1213, latitude: 8.93996, longitude: 99.16016, name: "กรูดปาล์มทอง", district: "พุนพิน", type: "yard", phone: "081-9587354", address: "35/7 หมู่ 1 ถ.พุนพิน-เคียนซา ต.กรูด อ.พุนพิน 84130" },
  { id: 1214, latitude: 9.2006, longitude: 99.220135, name: "ณัฐฐยาปาล์ม", district: "พุนพิน", type: "yard", phone: "082-8389545", address: "หมู่ 7 ต.ท่าข้าม อ.พุนพิน 84130" },
  { id: 1215, latitude: 8.85, longitude: 99.12, name: "กังฟูลานปาล์ม", district: "พุนพิน", type: "yard", phone: "089-8682515", address: "128/16 หมู่ 1 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1216, latitude: 9.00661, longitude: 99.22647, name: "หนองจอกปาล์ม", district: "พุนพิน", type: "yard", phone: "081-9708284", address: "60/1 หมู่ 4 ถ.หนองจอก-บ่อกรัง ต.ท่าสะท้อน อ.พุนพิน 84130" },
  { id: 1217, latitude: 8.9840, longitude: 99.1718, name: "ทุ่งเซียดปาล์ม", district: "พุนพิน", type: "yard", phone: "083-1746129", address: "185/4 หมู่ 1 ถ.พุนพิน-พระแสง ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1218, latitude: 9.0665, longitude: 99.2129, name: "ศ.อารีย์ปาล์ม", district: "พุนพิน", type: "yard", phone: "081-2725950", address: "1/8 หมู่ 7 ถ.สุราษฎร์ธานี-ตะกั่วป่า (กม.18) ต.ท่าข้าม อ.พุนพิน 84130" },
  { id: 1219, latitude: 9.00926, longitude: 99.17177, name: "ศักดิ์ชายธุรกิจ 2021", district: "พุนพิน", type: "yard", phone: "087-8866631", address: "65/6 หมู่ 5 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1220, latitude: 9.053, longitude: 99.279, name: "ธนากรณ์รุ่งเรืองปาล์ม", district: "พุนพิน", type: "yard", phone: "096-0348666", address: "107/20 หมู่ 3 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1221, latitude: 9.1519, longitude: 99.19997, name: "เรือง เจ ปาล์ม", district: "พุนพิน", type: "yard", phone: "086-6601044", address: "129/2 หมู่ 2 ถ.แยกท่ากูบ-สนามบิน ต.ศรีวิชัย อ.พุนพิน 84130" },
  { id: 1222, latitude: 9.042389, longitude: 99.167028, name: "19 ลานปาล์ม", district: "พุนพิน", type: "yard", phone: "095-4293499", address: "221 หมู่ 3 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1223, latitude: 9.05131, longitude: 99.17306, name: "ประภาพรปาล์มทอง", district: "พุนพิน", type: "yard", phone: "089-7313656", address: "97/1 หมู่ 3 ถ.สายเอเซีย ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1224, latitude: 9.1041, longitude: 99.0635, name: "ภิรมย์ภักดีปาล์ม", district: "พุนพิน", type: "yard", phone: "081-7874156", address: "1 หมู่ 10 ต.บางงอน อ.พุนพิน 84130" },
  { id: 1225, latitude: 9.209052, longitude: 99.14399, name: "สำราญเจริญกิจปาล์ม", district: "พุนพิน", type: "yard", phone: "084-3992499", address: "75 หมู่ 4 ต.ลีเล็ด อ.พุนพิน 84130" },
  { id: 1226, latitude: 9.14937, longitude: 99.10995, name: "บจ.น้ำเพชร วุ้ดชิพ", district: "พุนพิน", type: "yard", phone: "085-7897037", address: "2/10 หมู่ 6 ต.มะลวน อ.พุนพิน 84130" },
  { id: 1227, latitude: 9.16022, longitude: 99.16348, name: "ชุมแสงปาล์ม", district: "พุนพิน", type: "yard", phone: "081-0895659", address: "276/1 หมู่ 5 ต.มะลวน อ.พุนพิน 84130" },
  { id: 1228, latitude: 8.974, longitude: 99.207, name: "เหรียญทองปาล์ม", district: "พุนพิน", type: "yard", phone: "094-5934112", address: "150 หมู่ 2 ต.กรูด อ.พุนพิน 84130" },
  { id: 1229, latitude: 9.014, longitude: 99.141, name: "แหลมเศียร ปาล์มทอง", district: "พุนพิน", type: "yard", phone: "086-3773655", address: "82/5 หมู่ 6 ต.บางมะเดื่อ อ.พุนพิน 84130" },
  { id: 1230, latitude: 9.1502, longitude: 99.1375, name: "สุนีย์ลานปาล์ม", district: "พุนพิน", type: "yard", phone: "087-6900625", address: "170/1 หมู่ 6 ถ.ห้วยกรวด-วิภาวดี ต.มะลวน อ.พุนพิน 84130" },
  { id: 1231, latitude: 9.094064, longitude: 99.117668, name: "บจ.ทุ่งหลวงปาล์ม", district: "พุนพิน", type: "yard", phone: "080-0614950", address: "44/1 หมู่ 3 ต.น้ำรอบ อ.พุนพิน 84130" },
  { id: 1232, latitude: 9.1420822, longitude: 99.1790161, name: "จินดาพรปาล์ม (พุนพิน)", district: "พุนพิน", type: "yard", phone: "086-2694464", address: "36 หมู่ 2 ต.หัวเตย อ.พุนพิน 84130" },
  { id: 1233, latitude: 9.06980, longitude: 99.21296, name: "ประสิทธิ์ลานปาล์ม", district: "พุนพิน", type: "yard", phone: "081-8940572", address: "103 หมู่ 6 ถ.ท่าโรงช้าง-กม.0 ต.ท่าข้าม อ.พุนพิน 84130" },
  { id: 1235, latitude: 9.19206, longitude: 99.21803, name: "ทุ่งอ่าวปาล์ม", district: "พุนพิน", type: "yard", address: "52/3 หมู่ 3 ต.ศรีวิชัย อ.พุนพิน 84130" },
  { id: 1236, latitude: 9.0748, longitude: 99.1942, name: "เจริญกิจปาล์มทอง-สาขาหาดผก", district: "พุนพิน", type: "yard", phone: "080-5962464", address: "71/2 หมู่ 2 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1237, latitude: 8.81946, longitude: 99.04872, name: "หจก.เพชรทองพาราวู้ด", district: "พุนพิน", type: "yard", phone: "084-9183397", address: "141 หมู่ 5 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1238, latitude: 9.066910, longitude: 99.175735, name: "ลานเทไข่หวาน", district: "พุนพิน", type: "yard", phone: "095-4191064", address: "140/1 หมู่ 4 ถ.สายเอเซีย ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1239, latitude: 8.9739, longitude: 99.20565, name: "เมืองในปาล์ม", district: "พุนพิน", type: "yard", phone: "081-5398388", address: "105/2 หมู่ 2 ต.กรูด อ.พุนพิน 84130" },
  { id: 1240, latitude: 8.9904, longitude: 99.1724, name: "แก้วพิชัยปาล์ม", district: "พุนพิน", type: "yard", phone: "090-6985710", address: "132/1 หมู่ 1 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1242, latitude: 9.0971, longitude: 99.1272, name: "ลานเทอินทชาติ (สาขาทุ่งหลวง)", district: "พุนพิน", type: "yard", phone: "084-8398424", address: "64/2 หมู่ 3 ถ.ยางงาม-น้ำรอบ ต.น้ำรอบ อ.พุนพิน 84130" },
  { id: 1243, latitude: 8.91419, longitude: 99.12557, name: "ตะวันปาล์มพาราวู้ด", district: "พุนพิน", type: "yard", phone: "087-2745255", address: "3/1 หมู่ 4 ต.กรูด อ.พุนพิน 84130" },
  { id: 1245, latitude: 9.17143, longitude: 99.16872, name: "ตาเศษฐ์ลานปาล์ม", district: "พุนพิน", type: "yard", phone: "084-0510355", address: "27 หมู่ 3 ถ.ไชยาสายล่าง ต.มะลวน อ.พุนพิน 84130" },
  { id: 1246, latitude: 8.858686, longitude: 99.14834, name: "ปลายคลองปาล์ม", district: "พุนพิน", type: "yard", phone: "085-6191244", address: "87/1 หมู่ 1 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1247, latitude: 9.2116389, longitude: 99.235927, name: "ลานเทจักรพัฒน์ ปาล์ม", district: "พุนพิน", type: "yard", phone: "085-7924624", address: "1 หมู่ 4 ต.ลีเล็ด อ.พุนพิน 84130" },
  { id: 1248, latitude: 9.12933, longitude: 99.19311, name: "วิภาวดีปาล์ม 3 (บ้านทุ่งโพธิ์)", district: "พุนพิน", type: "yard", phone: "081-2701176", address: "22/3 หมู่ 1 ถ.พุนพิน-ไชยา ต.พุนพิน อ.พุนพิน 84130" },
  { id: 1249, latitude: 8.9329, longitude: 99.1281, name: "ลานปาล์มธิมาบุตร", district: "พุนพิน", type: "yard", phone: "093-6471915", address: "20/10 หมู่ 4 ถ.เคียนซา-ท่าโรงช้าง ต.กรูด อ.พุนพิน 84130" },
  { id: 1250, latitude: 8.870532, longitude: 99.077099, name: "ลานเขาพระปาล์ม", district: "พุนพิน", type: "yard", phone: "085-7830913", address: "4/5 หมู่ 1 ถ.ท่าโรงช้าง-เคียนซา ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1251, latitude: 9.15389, longitude: 99.16125, name: "หัวเตยปาล์ม", district: "พุนพิน", type: "yard", phone: "081-8942603", address: "16/1 หมู่ 1 ต.หัวเตย อ.พุนพิน 84130" },
  { id: 1252, latitude: 8.93431, longitude: 99.20683, name: "กังฟูลานปาล์ม 2", district: "พุนพิน", type: "yard", phone: "095-6454450", address: "93/9 หมู่ 2 ต.กรูด อ.พุนพิน 84130" },
  { id: 1253, latitude: 9.20222, longitude: 99.21954, name: "คมขำรุ่งเรืองปาล์ม", district: "พุนพิน", type: "yard", phone: "093-5804497", address: "หมู่ 4 ต.ลีเล็ด อ.พุนพิน 84130" },
  { id: 1255, latitude: 9.08034, longitude: 99.03953, name: "กลางณรงค์ปาล์ม", district: "พุนพิน", type: "yard", phone: "093-3015109", address: "44/1 หมู่ 7 ต.บางงอน อ.พุนพิน 84130" },
  { id: 1256, latitude: 8.8906, longitude: 99.1107, name: "วันเพ็ญปาล์ม", district: "พุนพิน", type: "yard", phone: "065-3598188", address: "141 หมู่ 3 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1257, latitude: 8.85585, longitude: 99.14914, name: "น้องทรายลานปาล์ม", district: "พุนพิน", type: "yard", phone: "094-9140404", address: "96/3 หมู่ 4 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1258, latitude: 9.154475, longitude: 99.220898, name: "จีรวรรณปาล์ม", district: "พุนพิน", type: "yard", phone: "081-1978743", address: "131 หมู่ 2 ต.ศรีวิชัย อ.พุนพิน 84130" },
  { id: 1260, latitude: 9.0420365, longitude: 99.1241143, name: "24 ปาล์มทอง", district: "พุนพิน", type: "yard", phone: "090-3541131", address: "60/9 หมู่ 5 ต.บางมะเดื่อ อ.พุนพิน 84130" },
  { id: 1261, latitude: 8.8709, longitude: 99.0784, name: "ลานตะวันปาล์มพาราวู้ด", district: "พุนพิน", type: "yard", phone: "081-1876276", address: "42/28 หมู่ 1 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1262, latitude: 9.1776758, longitude: 99.0584695, name: "จำนงค์ปาล์ม 2", district: "พุนพิน", type: "yard", phone: "081-8990556", address: "97/1 หมู่ 8 ต.มะลวน อ.พุนพิน 84170" },
  { id: 1264, latitude: 8.820673, longitude: 99.056351, name: "โบว์ศรีลานปาล์ม", district: "พุนพิน", type: "yard", phone: "063-2246502", address: "109/2 หมู่ 5 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1265, latitude: 8.9888, longitude: 99.2051, name: "ลานเทเจ๊ตุ้มปาล์ม", district: "พุนพิน", type: "yard", phone: "085-6551871", address: "88/19 หมู่ 7 ต.ท่าข้าม อ.พุนพิน 84130" },
  { id: 1266, latitude: 9.166257, longitude: 99.224749, name: "เรือง J ปาล์ม 2", district: "พุนพิน", type: "yard", phone: "086-6601044", address: "33 หมู่ 1 ต.ศรีวิชัย อ.พุนพิน 84120" },
  { id: 1267, latitude: 9.0651, longitude: 99.2440, name: "ศักดิ์ชายปาล์ม (พุนพิน)", district: "พุนพิน", type: "yard", phone: "061-6727609", address: "32/6 หมู่ 2 ต.เขาหัวควาย อ.พุนพิน 84130" },
  { id: 1268, latitude: 8.8904976, longitude: 99.517076, name: "ลานปาล์มพิกุลทอง", district: "พุนพิน", type: "yard", phone: "093-0879207", address: "32/4 หมู่ 1 ต.ตะปาน อ.พุนพิน 84130" },
  { id: 1269, latitude: 9.1592, longitude: 99.1303, name: "เลอเกษตรปาล์ม", district: "พุนพิน", type: "yard", phone: "081-0895659", address: "70/2 หมู่ 5 ต.มะลวน อ.พุนพิน 84130" },
  { id: 1271, latitude: 8.94477, longitude: 99.1393, name: "พรุแคปาล์ม", district: "พุนพิน", type: "yard", phone: "086-2823581", address: "2/5 หมู่ 6 ต.กรูด อ.พุนพิน 84130" },
  { id: 1272, latitude: 9.0955792, longitude: 99.086846, name: "จารึกลานปาล์ม", district: "พุนพิน", type: "yard", address: "1/1 หมู่ 4 ต.บางงอน อ.พุนพิน 84130" },
  { id: 1273, latitude: 8.9252879, longitude: 99.1514591, name: "พี เอ็น ปาล์ม", district: "พุนพิน", type: "yard", phone: "089-9094350", address: "147/2 หมู่ 3 ต.กรูด อ.พุนพิน 84130" },
  { id: 1274, latitude: 9.00496, longitude: 99.17095, name: "รัชชะตะปาล์ม", district: "พุนพิน", type: "yard", phone: "095-5187992", address: "53/3 หมู่ 5 ต.ท่าโรงช้าง อ.พุนพิน 84130" },
  { id: 1276, latitude: 8.9576032, longitude: 99.1640068, name: "โชคณภัทรธุรกิจ", district: "พุนพิน", type: "yard", phone: "098-8235965", address: "97/1 หมู่ 1 ต.กรูด อ.พุนพิน 84130" },
  // เมืองสุราษฎร์ธานี district yards
  { id: 1301, latitude: 9.039174, longitude: 99.376008, name: "สีวลีเกษตรภัณฑ์", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "086-9503959", address: "35/3 หมู่ 7 ถ.เซาน์เทิร์น ต.ขุนทะเล อ.เมืองสุราษฎร์ธานี 84100" },
  { id: 1302, latitude: 9.156573, longitude: 99.292595, name: "จ.เจริญโชคปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "094-3151881", address: "76/1 หมู่ 5 ต.บางใบไม้ อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1303, latitude: 9.01269, longitude: 99.36689, name: "กันตพิชญ์ (KTP) ลานปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "063-9611082", address: "140/2 หมู่ 4 ต.ขุนทะเล อ.เมืองสุราษฎร์ธานี 84100" },
  { id: 1304, latitude: 8.494243, longitude: 99.028251, name: "ทวีเดชปาล์ม (เมือง)", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "089-8738897", address: "44/19 หมู่ 5 ถ.สองแพรก-คลองน้อย ต.วัดประดู่ อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1305, latitude: 9.12754, longitude: 99.23451, name: "ลานปาล์มดวงใจ", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "081-4776482", address: "107/2 หมู่ 4 ต.คลองน้อย อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1306, latitude: 9.0924, longitude: 99.3757, name: "เจริญลานปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "086-4759011", address: "170/2 หมู่ 7 ต.มะขามเตี้ย อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1307, latitude: 9.0992, longitude: 99.2815, name: "โกอู๊ดลานปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "081-3707788", address: "184/11 หมู่ 7 ต.มะขามเตี้ย อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1308, latitude: 9.0723515, longitude: 99.3590317, name: "บจ.พี.ซี.ปาล์ม (2550) สาขา ขุนทะเล", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "077-217277", address: "52/1 หมู่ 1 ถ.สุราษฎร์-นาสาร ต.ขุนทะเล อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1309, latitude: 8.595682, longitude: 99.193549, name: "เจริญทรัพย์รับซื้อปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "086-9510614", address: "150/2 หมู่ 6 ต.ขุนทะเล อ.เมืองสุราษฎร์ธานี 84100" },
  { id: 1310, latitude: 9.184438, longitude: 99.328942, name: "คลองฉนากลานปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "098-3344536", address: "78 หมู่ 2 ต.คลองฉนาก อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1311, latitude: 9.0134, longitude: 99.3101, name: "ธิชา ลานปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "098-3128371", address: "39/2 หมู่ 6 ต.วัดประดู่ อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1312, latitude: 9.1481, longitude: 99.2273, name: "สีวสีเกษตรภัณฑ์", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "081-1742653", address: "หมู่ 2 ต.บางโพธิ์ อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1313, latitude: 9.074, longitude: 99.302, name: "บจ.บี.เอฟ.ทรานส์ฟอร์เมอร์", district: "เมืองสุราษฎร์ธานี", type: "yard", address: "95/8 หมู่ 5 ต.วัดประดู่ อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1314, latitude: 9.150906, longitude: 99.264911, name: "ลานปาล์มลุงแสง", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "081-6777947", address: "35/1 หมู่ 8 ถ.บางใบไม้ ต.คลองน้อย อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1315, latitude: 9.04703, longitude: 99.3532, name: "ท่าอู่ลานปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "089-8736460", address: "35/3 หมู่ 2 ต.ขุนทะเล อ.เมืองสุราษฎร์ธานี 84100" },
  { id: 1316, latitude: 9.145704, longitude: 99.266217, name: "คลองน้อยปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "089-7282810", address: "77/1 หมู่ 9 ต.คลองน้อย อ.เมืองสุราษฎร์ธานี 84000" },
  { id: 1317, latitude: 9.143795, longitude: 99.224396, name: "รัตนวานิชปาล์ม", district: "เมืองสุราษฎร์ธานี", type: "yard", phone: "081-5392606", address: "50/1 หมู่ 1 ต.คลองน้อย อ.เมืองสุราษฎร์ธานี 84000" },
  // วิภาวดี district yards
  { id: 1401, latitude: 9.2189, longitude: 98.9693, name: "ลานเทน้ำยางพี่เบิ้ล", district: "วิภาวดี", type: "yard", phone: "087-5504005", address: "54 หมู่ 6 ถ.วิภาวดี-คีรีรัฐนิคม ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1402, latitude: 9.215467, longitude: 98.965867, name: "สำอางบัวทอง", district: "วิภาวดี", type: "yard", phone: "063-6132685", address: "51 หมู่ 12 ถ.ท่าฉาง-วิภาวดี ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1403, latitude: 9.1871239, longitude: 99.0182579, name: "โพธิ์พนาปาล์ม", district: "วิภาวดี", type: "yard", phone: "089-8668520", address: "หมู่ 10 ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  { id: 1404, latitude: 9.17726, longitude: 98.95363, name: "วิภาวดีปาล์ม 1", district: "วิภาวดี", type: "yard", phone: "081-8314711", address: "104/3 หมู่ 1 ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  { id: 1405, latitude: 9.183, longitude: 98.9, name: "คลองปาวปาล์ม", district: "วิภาวดี", type: "yard", phone: "091-0188639", address: "95 หมู่ 11 ต.ตะกุกใต้ อ.วิภาวดี 84370" },
  { id: 1406, latitude: 9.150677, longitude: 98.963579, name: "A P ปาล์ม", district: "วิภาวดี", type: "yard", phone: "080-6499440", address: "62/2 หมู่ 2 ถ.ดอนเรียบ-วิภาวดี ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  { id: 1407, latitude: 9.249079, longitude: 98.921043, name: "วัชรี ปาล์ม", district: "วิภาวดี", type: "yard", phone: "065-6645413", address: "141/1 หมู่ 1 ถ.บ้านท่านหญิง ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1408, latitude: 9.146329, longitude: 99.0134652, name: "ลานปาล์มผู้ใหญ่หมก (บ้านควนทอง)", district: "วิภาวดี", type: "yard", address: "66/3 หมู่ 13 ต.ตะกุกใต้ อ.วิภาวดี" },
  { id: 1409, latitude: 9.15994, longitude: 98.89875, name: "คลองพายธุรกิจ", district: "วิภาวดี", type: "yard", phone: "087-2768408", address: "28/3 หมู่ 8 ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  { id: 1410, latitude: 9.241127, longitude: 98.981399, name: "สหกรณ์ผู้ปลูกปาล์มน้ำมันท่าฉาง-วิภาวดี จำกัด", district: "วิภาวดี", type: "yard", phone: "098-0154263", address: "4 หมู่ 4 ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1411, latitude: 9.21127, longitude: 98.95939, name: "เอส.พี.ปาล์ม", district: "วิภาวดี", type: "yard", phone: "081-0909888", address: "93 หมู่ 12 ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1412, latitude: 9.2480140, longitude: 98.9145508, name: "มยุรา อินทรมณี ลานเท", district: "วิภาวดี", type: "yard", phone: "087-8978199", address: "35/1 หมู่ 1 ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1413, latitude: 9.22044, longitude: 98.97094, name: "จันทร์-อรุณปาล์ม", district: "วิภาวดี", type: "yard", phone: "095-2646996", address: "64 หมู่ 12 ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1415, latitude: 9.13334, longitude: 98.97925, name: "ลานปาล์มปากลาง", district: "วิภาวดี", type: "yard", phone: "098-0143543", address: "90 หมู่ 3 ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  { id: 1417, latitude: 9.14333, longitude: 98.97023, name: "ลานปาล์มไร่ยาว", district: "วิภาวดี", type: "yard", address: "12/3 หมู่ 4 ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  { id: 1418, latitude: 9.1846187, longitude: 98.9019426, name: "อินทร์จันทร์ปาล์มทอง", district: "วิภาวดี", type: "yard", phone: "097-0064192", address: "35 หมู่ 11 ต.ตะกุกใต้ อ.วิภาวดี 84370" },
  { id: 1419, latitude: 9.1574, longitude: 98.9561, name: "เชี่ยวมะปรางปาล์ม", district: "วิภาวดี", type: "yard", phone: "084-7456225", address: "27/1 หมู่ 2 ต.ตะกุกใต้ อ.วิภาวดี" },
  { id: 1420, latitude: 9.2557, longitude: 98.9089, name: "อรุณ คงขันธ์ ลานเท", district: "วิภาวดี", type: "yard", address: "6/1 หมู่ 1 ต.ตะกุกเหนือ อ.วิภาวดี 84160" },
  { id: 1421, latitude: 9.2746, longitude: 98.885, name: "ลานปาล์ม จิตราภิรมย์", district: "วิภาวดี", type: "yard", phone: "084-8480363", address: "138/1 หมู่ 16 ต.ตะกุกเหนือ อ.วิภาวดี 84180" },
  { id: 1422, latitude: 9.211409, longitude: 98.9757949, name: "ลานเทโชคกฤษณพล", district: "วิภาวดี", type: "yard", phone: "082-2331355", address: "หมู่ 9 ต.ตะกุกใต้ อ.วิภาวดี 84180" },
  // เวียงสระ district yards
  { id: 1501, latitude: 8.63782, longitude: 99.33548, name: "สมบัติปาล์ม", district: "เวียงสระ", type: "yard", phone: "086-1206403", address: "236 หมู่ 8 ถ.เวียงสระ-พระแสง ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1502, latitude: 8.5626905, longitude: 99.3892906, name: "สาคร เจริญปาล์ม", district: "เวียงสระ", type: "yard", phone: "081-9562369", address: "6 หมู่ 4 ต.เขานิพันธ์ อ.เวียงสระ 84190" },
  { id: 1503, latitude: 8.5708681, longitude: 99.382684, name: "บ่าว-ฝน ลานเท", district: "เวียงสระ", type: "yard", phone: "095-0871333", address: "109/18 หมู่ 4 ต.เขานิพันธ์ อ.เวียงสระ 84190" },
  { id: 1504, latitude: 8.5565, longitude: 99.295822, name: "หานเพชรปาล์ม", district: "เวียงสระ", type: "yard", phone: "085-7415718", address: "หมู่ 6 ต.ทุ่งหลวง อ.เวียงสระ" },
  { id: 1505, latitude: 8.606961, longitude: 99.319673, name: "ทุ่งหลวงปาล์ม", district: "เวียงสระ", type: "yard", phone: "084-6896985", address: "74/1 หมู่ 2 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
  { id: 1506, latitude: 8.4869699, longitude: 99.290769, name: "JM รุ่งเรืองทวีทปาล์ม", district: "เวียงสระ", type: "yard", phone: "095-4199269", address: "115/10 หมู่ 6 ต.คลองฉนวน อ.เวียงสระ" },
  { id: 1507, latitude: 8.65163, longitude: 99.31633, name: "เชาวลิตปาล์ม", district: "เวียงสระ", type: "yard", phone: "081-0883465", address: "60 หมู่ 5 ถ.วัดเวียงสระ ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1508, latitude: 8.64883, longitude: 99.29803, name: "เวียงสระปาล์ม 1", district: "เวียงสระ", type: "yard", phone: "092-8878816", address: "35/4 หมู่ 7 ถ.วัดเวียงสระ ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1509, latitude: 8.576, longitude: 99.349, name: "ลานเทศักดิ์ชาย (เวียงสระ)", district: "เวียงสระ", type: "yard", phone: "086-2815781", address: "38/21 หมู่ 1 ต.เขานิพันธ์ อ.เวียงสระ" },
  { id: 1510, latitude: 8.515703, longitude: 99.324784, name: "คลองฉนวนปาล์ม", district: "เวียงสระ", type: "yard", phone: "093-6298923", address: "59/6 หมู่ 3 ต.คลองฉนวน อ.เวียงสระ 84190" },
  { id: 1511, latitude: 8.6662, longitude: 99.3486, name: "ช่วยคงลานปาล์ม", district: "เวียงสระ", type: "yard", phone: "064-3587722", address: "38/2 หมู่ 2 ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1512, latitude: 8.6777, longitude: 99.3743, name: "ลานเท ช.มหาราช", district: "เวียงสระ", type: "yard", phone: "081-8938769", address: "10/4 หมู่ 6 ต.บ้านส้อง อ.เวียงสระ 84190" },
  { id: 1513, latitude: 8.65669, longitude: 99.33546, name: "เวียงทองปาล์ม", district: "เวียงสระ", type: "yard", phone: "081-0773485", address: "20/3 หมู่ 2 ถ.สายเอเซีย ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1514, latitude: 8.65477, longitude: 99.29654, name: "หจก.เมืองเวียงปาล์ม", district: "เวียงสระ", type: "yard", phone: "087-2777527", address: "40 หมู่ 7 ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1515, latitude: 8.5209, longitude: 99.3248, name: "อานนท์ลานเท", district: "เวียงสระ", type: "yard", phone: "086-2741170", address: "46/1 หมู่ 3 ต.คลองฉนวน อ.เวียงสระ 84190" },
  { id: 1517, latitude: 8.6734942, longitude: 99.3667879, name: "มหาราชปาล์ม", district: "เวียงสระ", type: "yard", phone: "080-4481559", address: "93/5 หมู่ 6 ต.บ้านส้อง อ.เวียงสระ 84130" },
  { id: 1519, latitude: 8.585686, longitude: 99.283844, name: "วังใหญ่ปาล์ม", district: "เวียงสระ", type: "yard", phone: "080-1477779", address: "81/3 หมู่ 5 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
  { id: 1520, latitude: 8.66428, longitude: 99.31649, name: "ลานเขาสมพรปาล์ม", district: "เวียงสระ", type: "yard", phone: "087-0859817", address: "121/80 หมู่ 9 ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1521, latitude: 8.5486, longitude: 99.3240, name: "ลานเทศักดิ์ชายปาล์ม (สาขาคลองฉนวน)", district: "เวียงสระ", type: "yard", phone: "087-8866631", address: "102/11 หมู่ 10 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
  { id: 1522, latitude: 8.512, longitude: 99.285, name: "สมหมายลานเทปาล์ม", district: "เวียงสระ", type: "yard", phone: "087-2848123", address: "2/18 หมู่ 12 ต.คลองฉนวน อ.เวียงสระ 84190" },
  { id: 1523, latitude: 8.6395597, longitude: 99.348587, name: "บจ.พี.ซี.ปาล์ม(2550) สาขา เวียงสระ", district: "เวียงสระ", type: "yard", phone: "077-361717", address: "254 หมู่ 1 ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1525, latitude: 8.552516, longitude: 99.341335, name: "ศักชายลานเท", district: "เวียงสระ", type: "yard", phone: "098-8940415", address: "30/3 หมู่ 1 ถ.สายเอเซีย ต.คลองฉนวน อ.เวียงสระ 84190" },
  { id: 1526, latitude: 8.63748, longitude: 99.38087, name: "เจ้านายลานปาล์ม", district: "เวียงสระ", type: "yard", phone: "091-0360641", address: "20/7 หมู่ 2 ต.บ้านส้อง อ.เวียงสระ 84190" },
  { id: 1527, latitude: 8.6386, longitude: 99.2999, name: "ส.บุญทองปาล์ม", district: "เวียงสระ", type: "yard", phone: "094-8073148", address: "84 หมู่ 10 ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1528, latitude: 8.8043462, longitude: 99.3037080, name: "ยิ่งเจริญ ลานเท", district: "เวียงสระ", type: "yard", phone: "098-0155361", address: "12/3 หมู่ 6 ต.คลองฉนวน อ.เวียงสระ 84190" },
  { id: 1529, latitude: 8.571167, longitude: 99.316425, name: "สมคิ้มปาล์ม", district: "เวียงสระ", type: "yard", phone: "093-6931470", address: "44 หมู่ 3 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
  { id: 1530, latitude: 8.66516, longitude: 99.31684, name: "ลานหนองโสนปาล์ม", district: "เวียงสระ", type: "yard", phone: "087-8947790", address: "19/1 หมู่ 9 ต.เวียงสระ อ.เวียงสระ 84190" },
  { id: 1531, latitude: 8.62261, longitude: 99.29903, name: "ริยาพันธ์ ปาล์มทอง", district: "เวียงสระ", type: "yard", phone: "081-0866679", address: "หมู่ 7 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
  { id: 1532, latitude: 8.621863, longitude: 99.301763, name: "พูลศักดิ์ปาล์มออยล์", district: "เวียงสระ", type: "yard", phone: "061-8644652", address: "141/4 หมู่ 7 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
  { id: 1533, latitude: 8.6292518, longitude: 99.315548, name: "นิยมปาล์ม", district: "เวียงสระ", type: "yard", phone: "086-9224745", address: "126/1 หมู่ 7 ต.ทุ่งหลวง อ.เวียงสระ 84190" },
];

const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

const factoryIcon = createCustomIcon("#16a34a");
const yardIcon = createCustomIcon("#eab308");
const userIcon = createCustomIcon("#3b82f6", 20);
const routeFactoryIcon = createCustomIcon("#ef4444", 32);
const routeYardIcon = createCustomIcon("#f97316", 32);

const routeColors = ["#ef4444", "#3b82f6", "#8b5cf6"];

function MapBoundsHandler({ userLocation, routeLocations }: { userLocation: UserLocation | null; routeLocations: PurchaseLocationWithDistance[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation && routeLocations.length > 0) {
      const bounds = new LatLngBounds(
        [userLocation.latitude, userLocation.longitude],
        [userLocation.latitude, userLocation.longitude]
      );
      routeLocations.forEach((loc) => {
        bounds.extend([loc.latitude, loc.longitude]);
      });
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 11);
    }
  }, [map, userLocation, routeLocations]);
  
  return null;
}

export default function PurchaseMapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [routeMode, setRouteMode] = useState<"factory" | "yard" | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | undefined>();

  const requestLocation = useCallback(() => {
    setIsRequestingLocation(true);
    setLocationError(undefined);

    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsRequestingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("กรุณาอนุญาตการเข้าถึงตำแหน่ง");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("ไม่สามารถระบุตำแหน่งได้");
            break;
          case error.TIMEOUT:
            setLocationError("การระบุตำแหน่งหมดเวลา");
            break;
          default:
            setLocationError("เกิดข้อผิดพลาดในการระบุตำแหน่ง");
        }
        setIsRequestingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleRouteMode = (mode: "factory" | "yard") => {
    if (routeMode === mode) {
      setRouteMode(null);
    } else {
      setRouteMode(mode);
      if (!userLocation) {
        requestLocation();
      }
    }
  };

  const nearestLocations = useMemo((): PurchaseLocationWithDistance[] => {
    if (!userLocation || !routeMode) return [];
    
    const locationsOfType = purchaseLocations.filter((loc) => loc.type === routeMode);
    const withDistance: PurchaseLocationWithDistance[] = locationsOfType.map((loc) => ({
      ...loc,
      distance: haversineDistance(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude),
    }));
    
    return withDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }, [userLocation, routeMode]);

  const districts = useMemo(() => {
    const uniqueDistricts = Array.from(new Set(purchaseLocations.map((loc) => loc.district)));
    return uniqueDistricts.sort();
  }, []);

  const filteredLocations = useMemo(() => {
    return purchaseLocations.filter((loc) => {
      const matchDistrict = selectedDistrict === "all" || loc.district === selectedDistrict;
      const matchType = selectedType === "all" || loc.type === selectedType;
      return matchDistrict && matchType;
    });
  }, [selectedDistrict, selectedType]);

  const mapCenter = useMemo(() => {
    if (filteredLocations.length === 0) {
      return { lat: 9.0, lng: 99.2 };
    }
    const avgLat = filteredLocations.reduce((sum, loc) => sum + loc.latitude, 0) / filteredLocations.length;
    const avgLng = filteredLocations.reduce((sum, loc) => sum + loc.longitude, 0) / filteredLocations.length;
    return { lat: avgLat, lng: avgLng };
  }, [filteredLocations]);

  return (
    <div className="bg-background flex flex-col">
      <div className="flex-1 p-4 max-w-5xl mx-auto w-full flex flex-col gap-4">
        <Card className="p-3 relative z-20" data-testid="filter-section">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">แผนที่แหล่งรับซื้อปาล์ม</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">ประเภท:</span>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[120px] bg-background border-primary/30" data-testid="select-type">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all" data-testid="select-type-all">ทั้งหมด</SelectItem>
                      <SelectItem value="factory" data-testid="select-type-factory">โรงงาน</SelectItem>
                      <SelectItem value="yard" data-testid="select-type-yard">ลานเท</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                  <span className="text-sm text-muted-foreground">อำเภอ:</span>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="w-[160px] bg-background border-primary/30" data-testid="select-district">
                      <SelectValue placeholder="เลือกอำเภอ" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all" data-testid="select-district-all">ทั้งหมด ({selectedType === "all" ? purchaseLocations.length : purchaseLocations.filter(loc => loc.type === selectedType).length})</SelectItem>
                      {districts.map((district) => {
                        const count = purchaseLocations.filter((loc) => {
                          const matchDistrict = loc.district === district;
                          const matchType = selectedType === "all" || loc.type === selectedType;
                          return matchDistrict && matchType;
                        }).length;
                        return (
                          <SelectItem key={district} value={district} data-testid={`select-district-${district}`}>
                            {district} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">เส้นทางใกล้คุณ 3 อันดับ:</span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={routeMode === "factory" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRouteMode("factory")}
                  disabled={isRequestingLocation}
                  className="gap-1.5"
                  data-testid="btn-route-factory"
                >
                  <Factory className="h-4 w-4" />
                  <span>โรงงาน</span>
                </Button>
                <Button
                  variant={routeMode === "yard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRouteMode("yard")}
                  disabled={isRequestingLocation}
                  className="gap-1.5"
                  data-testid="btn-route-yard"
                >
                  <Warehouse className="h-4 w-4" />
                  <span>ลานเท</span>
                </Button>
                {isRequestingLocation && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            
            {locationError && (
              <p className="text-xs text-destructive">{locationError}</p>
            )}
          </div>
        </Card>

        <div style={{ height: "450px" }} className="w-full rounded-lg overflow-hidden border" data-testid="purchase-map-container">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={9}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBoundsHandler userLocation={userLocation} routeLocations={nearestLocations} />
            
            {userLocation && (
              <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-sm">ตำแหน่งของคุณ</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {userLocation && nearestLocations.map((loc, index) => (
              <Polyline
                key={`route-${loc.id}`}
                positions={[
                  [userLocation.latitude, userLocation.longitude],
                  [loc.latitude, loc.longitude]
                ]}
                pathOptions={{ 
                  color: routeColors[index], 
                  weight: 4, 
                  opacity: 0.7,
                  dashArray: index === 0 ? undefined : "10, 10"
                }}
              />
            ))}
            
            {nearestLocations.map((loc, index) => (
              <Marker
                key={`route-marker-${loc.id}`}
                position={[loc.latitude, loc.longitude]}
                icon={routeMode === "factory" ? routeFactoryIcon : routeYardIcon}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-sm flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white" style={{ backgroundColor: routeColors[index] }}>
                        {index + 1}
                      </span>
                      {loc.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {routeMode === "factory" ? "โรงงาน" : "ลานเท"} - อำเภอ {loc.district}
                    </p>
                    <p className="text-xs font-medium mt-1">
                      ระยะทาง: {loc.distance.toFixed(1)} กม.
                    </p>
                    <Link href={`/location/${loc.id}`}>
                      <Button size="sm" variant="outline" className="mt-2 w-full text-xs" data-testid={`btn-view-route-location-${loc.id}`}>
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {filteredLocations
              .filter(loc => !nearestLocations.some(nl => nl.id === loc.id))
              .map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={location.type === "factory" ? factoryIcon : yardIcon}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {location.type === "factory" ? "โรงงาน" : "ลานเท"} - อำเภอ {location.district}
                    </p>
                    <Link href={`/location/${location.id}`}>
                      <Button size="sm" variant="outline" className="mt-2 w-full text-xs" data-testid={`btn-view-location-${location.id}`}>
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <Card className="p-3" data-testid="purchase-map-info">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground">
              แสดง <span className="font-semibold text-foreground">{filteredLocations.length}</span> แหล่งรับซื้อ
              {selectedDistrict !== "all" && (
                <span> ในอำเภอ<span className="font-semibold text-foreground">{selectedDistrict}</span></span>
              )}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
                <span className="text-xs text-muted-foreground">โรงงาน ({filteredLocations.filter(l => l.type === "factory").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-xs text-muted-foreground">ลานเท ({filteredLocations.filter(l => l.type === "yard").length})</span>
              </div>
            </div>
          </div>
        </Card>

        {nearestLocations.length > 0 && (
          <Card className="p-3" data-testid="route-recommendations">
            <div className="flex items-center gap-2 mb-3">
              <MapPinned className="h-5 w-5 text-primary" />
              <span className="font-medium">เส้นทางแนะนำ 3 อันดับ ({routeMode === "factory" ? "โรงงาน" : "ลานเท"}ใกล้คุณ)</span>
            </div>
            <div className="space-y-2">
              {nearestLocations.map((loc, index) => (
                <Link href={`/location/${loc.id}`} key={loc.id}>
                  <div
                    className="p-3 rounded-md bg-muted/50 flex items-center gap-3 hover-elevate cursor-pointer"
                    data-testid={`route-recommendation-${index + 1}`}
                  >
                    <span 
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: routeColors[index] }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{loc.name}</p>
                      <p className="text-xs text-muted-foreground">อำเภอ {loc.district}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {loc.distance.toFixed(1)} กม.
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
            {userLocation && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                คำนวณจากตำแหน่งของคุณ ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
              </p>
            )}
          </Card>
        )}

        <Card className="p-3" data-testid="purchase-locations-list">
          <p className="text-sm font-medium mb-3">รายชื่อแหล่งรับซื้อ:</p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredLocations.map((location) => (
              <Link href={`/location/${location.id}`} key={location.id}>
                <div
                  className="p-2 rounded-md bg-muted/50 flex items-start justify-between gap-2 hover-elevate cursor-pointer"
                  data-testid={`purchase-location-${location.id}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${location.type === "factory" ? "bg-green-600" : "bg-yellow-500"}`}></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground">{location.type === "factory" ? "โรงงาน" : "ลานเท"} - อำเภอ {location.district}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
