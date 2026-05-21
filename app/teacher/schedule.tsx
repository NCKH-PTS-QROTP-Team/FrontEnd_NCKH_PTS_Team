import React, { useEffect, useState, useMemo } from "react";
import {
  View, Text, ScrollView, useWindowDimensions,
  TouchableOpacity, ActivityIndicator, Modal, Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import WeeklySchedule from "@/components/WeeklySchedule";
import { MonthCalendar, isoToDate } from "@/components/MonthCalendar";
import { useRouter } from "expo-router";
import { scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import type { Schedule as ApiSchedule } from "@/apis/services/schedule.service";
import { LinearGradient } from "expo-linear-gradient";

interface DayScheduleItem {
  id: string;
  courseName: string;
  className: string;
  time: string;
  room: string;
  scheduleType?: "CLASS" | "EXAM";
  dayOfWeekStr?: string;
  date?: string;
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS: Record<number, string> = { 2: "Thứ Hai", 3: "Thứ Ba", 4: "Thứ Tư", 5: "Thứ Năm", 6: "Thứ Sáu", 7: "Thứ Bảy", 8: "Chủ Nhật" };
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

const isCurrentTimeInRange = (timeStr?: string) => {
  if (!timeStr) return false;
  const cleaned = timeStr.replace(/\s+/g, "");
  const match = cleaned.match(/^(\d{2}:\d{2})[-–](\d{2}:\d{2})$/);
  if (!match) return false;
  const [_, start, end] = match;
  
  const today = new Date();
  const currentMins = today.getHours() * 60 + today.getMinutes();
  
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  
  return currentMins >= startMins && currentMins <= endMins;
};

export default function TeacherScheduleScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 24 : isMobile ? 16 : 20;
  const BLUE = "#3b82f6";

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"all" | "class" | "exam">("all");
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [daySchedules, setDaySchedules] = useState<DayScheduleItem[]>([]);
  const [rawSchedules, setRawSchedules] = useState<ApiSchedule[]>([]);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DayScheduleItem | null>(null);
  const PAGE_SIZE = 15;

  // Load teacherId once on mount
  useEffect(() => {
    getTeacherIdFromToken().then((id) => setTeacherId(id));
  }, []);

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const dayName = WEEKDAYS[selectedDate.getDay()];
  const dateStr = `${dayName}, ${String(selectedDate.getDate()).padStart(2,"0")}/${String(selectedDate.getMonth()+1).padStart(2,"0")}/${selectedDate.getFullYear()}`;

  useEffect(() => { setPage(1); }, [daySchedules]);
  const totalPages = Math.ceil(daySchedules.length / PAGE_SIZE);
  const paginatedSchedules = useMemo(() => daySchedules.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [daySchedules, page]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const teacherId = await getTeacherIdFromToken();
        if (!teacherId) return;
        const dateOnly = toIsoDate(selectedDate);
        const params: any = { teacherId, fromDate: dateOnly, toDate: dateOnly };
        if (selectedView === "class") params.scheduleType = "CLASS";
        if (selectedView === "exam") params.scheduleType = "EXAM";

        const list = await scheduleService.getSchedules(params);
        const seen = new Set<string>();
        const unique = list.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });

        const mapped: DayScheduleItem[] = unique.map(s => ({
          id: s.id,
          courseName: s.subjectName || s.courseName || "Không rõ",
          className: (s as any).className || "",
          time: `${s.startTime} - ${s.endTime}`,
          room: s.room || "",
          scheduleType: s.scheduleType,
          dayOfWeekStr: s.dayOfWeek ? DAY_LABELS[s.dayOfWeek] : undefined,
          date: s.date,
        }));
        setDaySchedules(mapped);

        if (isDesktop || timeFilter === "month") {
          const ms = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          const me = new Date(selectedDate.getFullYear(), selectedDate.getMonth()+1, 0);
          const month = await scheduleService.getSchedules({ teacherId, fromDate: toIsoDate(ms), toDate: toIsoDate(me) });
          setRawSchedules(month);
        } else {
          setRawSchedules(unique);
        }
      } catch (e) {
        console.error(e);
        setDaySchedules([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedDate, selectedView, timeFilter]);

  const renderList = () => {
    if (loading) return (
      <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.border, alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "center" }}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={{ fontSize: 15, color: Colors.textSecondary }}>Đang tải lịch dạy...</Text>
      </View>
    );
    if (daySchedules.length === 0) return (
      <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: isDesktop ? 60 : 40, borderWidth: 1, borderColor: Colors.borderLight, alignItems: "center", ...getWebShadow("lg") }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Ionicons name="calendar-outline" size={40} color={Colors.primary} />
        </View>
        <Text style={{ fontSize: isDesktop ? 20 : 17, fontWeight: "800", color: Colors.textHeading, marginBottom: 8, textAlign: "center" }}>
          {isToday ? "Hôm nay không có lịch dạy" : "Ngày này không có lịch dạy"}
        </Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: "center", maxWidth: 320, lineHeight: 22 }}>
          Không có tiết học nào được xếp lịch vào ngày này.
        </Text>
      </View>
    );
    return (
      <>
        {paginatedSchedules.map(s => (
          <TouchableOpacity key={s.id} activeOpacity={0.8}
            onPress={() => { setSelectedSchedule(s); setModalVisible(true); }}
            style={{ backgroundColor: "#fff", borderRadius: 20, padding: isDesktop ? 20 : 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4, borderLeftColor: s.scheduleType === "EXAM" ? Colors.error : Colors.primary, ...getWebShadow("md"), ...getWebCursor() }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Text style={{ fontSize: isMobile ? 15 : 17, fontWeight: "700", color: Colors.textHeading, flex: 1, marginRight: 8 }} numberOfLines={2}>{s.courseName}</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {s.scheduleType === "EXAM" && (
                  <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.error }}>THI</Text>
                  </View>
                )}
                {timeFilter !== "day" && s.dayOfWeekStr && (
                  <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.primary }}>{s.dayOfWeekStr}</Text>
                  </View>
                )}
              </View>
            </View>
            {s.className ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="people" size={14} color={Colors.primary} />
                </View>
                <Text style={{ fontSize: 13, color: Colors.textHeading, fontWeight: "500" }}>Lớp: {s.className}</Text>
              </View>
            ) : null}
            <View style={{ backgroundColor: Colors.surface, borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textHeading }}>{s.time}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="business-outline" size={16} color={Colors.success} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textHeading }}>{s.room}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {totalPages > 1 && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <TouchableOpacity disabled={page===1} onPress={() => setPage(p=>p-1)} style={[{ width:40, height:40, borderRadius:20, backgroundColor:"#fff", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:Colors.border, ...getWebShadow("sm"), ...getWebCursor() }, page===1 && { opacity:0.4 }]}>
              <Ionicons name="chevron-back" size={20} color={page===1 ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
            <View style={{ paddingHorizontal:16, paddingVertical:8, backgroundColor:"#fff", borderRadius:20, borderWidth:1, borderColor:Colors.border }}>
              <Text style={{ fontSize:14, fontWeight:"700", color:Colors.textSecondary }}>Trang {page} / {totalPages}</Text>
            </View>
            <TouchableOpacity disabled={page===totalPages} onPress={() => setPage(p=>p+1)} style={[{ width:40, height:40, borderRadius:20, backgroundColor:"#fff", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:Colors.border, ...getWebShadow("sm"), ...getWebCursor() }, page===totalPages && { opacity:0.4 }]}>
              <Ionicons name="chevron-forward" size={20} color={page===totalPages ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="light" />

      {isDesktop ? (
        <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" }}>
          {/* LEFT: Month calendar */}
          <View style={{ width: 300, flexShrink: 0, backgroundColor: "#fff", borderRightWidth: 1, borderRightColor: Colors.border, ...(Platform.OS === "web" ? { position: "sticky" as any, top: 0, height: "100vh" as any, overflowY: "auto" as any } : { alignSelf: "flex-start" }) }}>
            <LinearGradient colors={["#1E3A8A", "#3B82F6"]} start={{x:0,y:0}} end={{x:1,y:1}} style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="calendar" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 }}>Thời khóa biểu</Text>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff" }}>Lịch dạy của tôi</Text>
                </View>
              </View>
            </LinearGradient>
            <ScrollView showsVerticalScrollIndicator={false}>
              <MonthCalendar schedules={rawSchedules as any} selectedISO={toIsoDate(selectedDate)} onSelectDay={iso => setSelectedDate(isoToDate(iso))} themeColor={BLUE} />
              <View style={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}>
                <View style={{ height: 1, backgroundColor: Colors.border, marginBottom: 16 }} />
                <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Ngày đang chọn</Text>
                <View style={{ backgroundColor: "#eff6ff", borderRadius: 12, padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.primary }}>{dateStr}</Text>
                  {isToday && <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary }} /><Text style={{ fontSize: 12, color: Colors.primary, fontWeight: "600" }}>Hôm nay</Text></View>}
                </View>
                {!isToday && (
                  <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={{ marginTop: 10, alignItems: "center", paddingVertical: 8, backgroundColor: "#eff6ff", borderRadius: 10, ...getWebCursor() }}>
                    <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "600" }}>↩ Về hôm nay</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>

          {/* RIGHT: Weekly timetable grid (same as student) */}
          <View style={{ flex: 1, overflow: "hidden" }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
              {/* Chỉ render khi có teacherId — tránh race condition fetch student data */}
              {teacherId ? (
                <WeeklySchedule targetDate={selectedDate} teacherId={teacherId} />
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 60 }}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>Đang tải...</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* Mobile */
        <View style={{ flex: 1 }}>
          <LinearGradient colors={["#1E3A8A","#3B82F6"]} start={{x:0,y:0}} end={{x:1,y:1}} style={{ paddingTop: isMobile ? 52 : 36, paddingHorizontal, paddingBottom: 16, elevation: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="calendar" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" }}>Thời khóa biểu</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }} numberOfLines={1}>{dateStr}</Text>
              </View>
              {isToday && <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}><Text style={{ fontSize: 12, color: "#fff", fontWeight: "700" }}>Hôm nay</Text></View>}
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 14, padding: 4, gap: 4 }}>
              {([{id:"day",label:"Ngày",icon:"today-outline"},{id:"week",label:"Tuần",icon:"calendar-outline"},{id:"month",label:"Tháng",icon:"calendar-number-outline"}] as const).map(f => {
                const isActive = timeFilter === f.id;
                return (
                  <TouchableOpacity key={f.id} onPress={() => setTimeFilter(f.id as any)} style={{ flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, paddingVertical:10, borderRadius:10, backgroundColor: isActive?"#fff":"transparent", ...getWebCursor() }} activeOpacity={0.7}>
                    <Ionicons name={f.icon as any} size={15} color={isActive ? Colors.primary : "rgba(255,255,255,0.85)"} />
                    <Text style={{ fontSize:13, fontWeight: isActive?"800":"600", color: isActive ? Colors.primary : "rgba(255,255,255,0.85)" }}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>

          <View style={{ flexDirection:"row", backgroundColor:"#fff", paddingHorizontal, paddingVertical:10, gap:8, borderBottomWidth:1, borderBottomColor:Colors.border, elevation:2 }}>
            {([{id:"all",label:"Tất cả",icon:"apps-outline"},{id:"class",label:"Lịch học",icon:"book-outline"},{id:"exam",label:"Lịch thi",icon:"document-text-outline"}] as const).map(tab => {
              const isActive = selectedView === tab.id;
              return (
                <TouchableOpacity key={tab.id} onPress={() => setSelectedView(tab.id as any)} style={{ flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:5, paddingVertical:8, borderRadius:10, backgroundColor: isActive ? "#eff6ff" : Colors.surface, borderWidth:1, borderColor: isActive ? Colors.primary : Colors.border, ...getWebCursor() }} activeOpacity={0.7}>
                  <Ionicons name={tab.icon as any} size={14} color={isActive ? Colors.primary : Colors.textSecondary} />
                  <Text style={{ fontSize:12, fontWeight: isActive?"700":"500", color: isActive ? Colors.primary : Colors.textSecondary }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={{ flex:1 }} contentContainerStyle={{ paddingHorizontal, paddingTop:16, paddingBottom:100 }} showsVerticalScrollIndicator={false}>
            {timeFilter !== "day" && (
              <View style={{ marginBottom: 16 }}>
                {timeFilter === "month" ? (
                  <MonthCalendar schedules={rawSchedules as any} selectedISO={toIsoDate(selectedDate)} onSelectDay={iso => setSelectedDate(isoToDate(iso))} themeColor={BLUE} />
                ) : (
                  <WeeklyCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate}
                    onPrevWeek={() => { const d=new Date(selectedDate); d.setDate(d.getDate()-7); setSelectedDate(d); }}
                    onNextWeek={() => { const d=new Date(selectedDate); d.setDate(d.getDate()+7); setSelectedDate(d); }}
                  />
                )}
              </View>
            )}
            {timeFilter === "day" && (
              <View style={{ marginBottom:16 }}>
                <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:"#fff", borderRadius:16, borderWidth:1, borderColor:Colors.border, overflow:"hidden", ...getWebShadow("sm") }}>
                  <TouchableOpacity onPress={() => { const d=new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d); }} style={{ padding:14, ...getWebCursor() }}>
                    <Ionicons name="chevron-back" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <View style={{ flex:1, alignItems:"center", paddingVertical:12 }}>
                    <Text style={{ fontSize:15, fontWeight:"800", color:Colors.textHeading }}>{dateStr}</Text>
                    {isToday ? (
                      <View style={{ flexDirection:"row", alignItems:"center", gap:4, marginTop:3 }}><View style={{ width:6, height:6, borderRadius:3, backgroundColor:Colors.primary }} /><Text style={{ fontSize:11, color:Colors.primary, fontWeight:"600" }}>Hôm nay</Text></View>
                    ) : (
                      <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={{ marginTop:3, ...getWebCursor() }}>
                        <Text style={{ fontSize:11, color:Colors.primary, fontWeight:"600" }}>↩ Về hôm nay</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => { const d=new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d); }} style={{ padding:14, ...getWebCursor() }}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <Text style={{ fontSize:15, fontWeight:"700", color:Colors.textHeading }}>
                {timeFilter==="day"?"Lịch dạy trong ngày":timeFilter==="week"?"Lịch dạy trong tuần":"Lịch dạy trong tháng"}
              </Text>
              {!loading && <View style={{ backgroundColor:"#eff6ff", paddingHorizontal:10, paddingVertical:4, borderRadius:12 }}><Text style={{ fontSize:12, fontWeight:"700", color:Colors.primary }}>{daySchedules.length} lịch</Text></View>}
            </View>
            {renderList()}
          </ScrollView>
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={{ flex:1, backgroundColor:"rgba(0,0,0,0.5)", justifyContent:"center", alignItems:"center", padding:16 }} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={{ width:"100%", maxWidth:400, backgroundColor:"#fff", borderRadius:20, padding:24, ...getWebShadow("lg") }}>
            {selectedSchedule && (
              <>
                <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <View style={{ flex:1, paddingRight:16 }}>
                    <Text style={{ fontSize:20, fontWeight:"700", color:Colors.textHeading, lineHeight:28, marginBottom:4 }}>{selectedSchedule.courseName}</Text>
                    <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
                      <View style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:8, backgroundColor: selectedSchedule.scheduleType==="EXAM" ? "#FEE2E2" : "#eff6ff" }}>
                        <Text style={{ fontSize:12, fontWeight:"700", color: selectedSchedule.scheduleType==="EXAM" ? Colors.error : Colors.primary }}>
                          {selectedSchedule.scheduleType==="EXAM" ? "LỊCH THI" : "LỊCH DẠY"}
                        </Text>
                      </View>
                      {selectedSchedule.dayOfWeekStr && <Text style={{ fontSize:13, color:Colors.textSecondary }}>{selectedSchedule.dayOfWeekStr}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding:4 }}>
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={{ gap:16 }}>
                  {[
                    ...(selectedSchedule.className ? [{ icon:"people-outline", label:"Lớp học", value: selectedSchedule.className }] : []),
                    { icon:"business-outline", label:"Phòng học", value: selectedSchedule.room },
                    { icon:"time-outline", label:"Thời gian", value: selectedSchedule.time },
                  ].map(row => (
                    <View key={row.label} style={{ flexDirection:"row", alignItems:"flex-start", gap:12 }}>
                      <Ionicons name={row.icon as any} size={20} color={Colors.textSecondary} style={{ marginTop:2 }} />
                      <View>
                        <Text style={{ fontSize:13, color:Colors.textSecondary, marginBottom:2 }}>{row.label}</Text>
                        <Text style={{ fontSize:15, fontWeight:"500", color:Colors.textHeading }}>{row.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                {(() => {
                  const isScheduleToday = selectedSchedule && (selectedSchedule.date ? selectedSchedule.date === toIsoDate(new Date()) : isToday);
                  const isScheduleCurrentTime = selectedSchedule ? isCurrentTimeInRange(selectedSchedule.time) : false;
                  const showQuickNav = isScheduleToday && isScheduleCurrentTime;
                  if (!showQuickNav) return null;
                  return (
                    <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSecondary, marginBottom: 10 }}>
                        ⚡ Ca dạy đang diễn ra, chuyển nhanh đến:
                      </Text>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setModalVisible(false);
                            router.push("/teacher/generate-qr");
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: Colors.primary,
                            paddingVertical: 10,
                            borderRadius: 10,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 6,
                            ...getWebCursor(),
                          }}
                        >
                          <Ionicons name="qr-code-outline" size={16} color="#fff" />
                          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Điểm danh QR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setModalVisible(false);
                            router.push("/teacher/generate-otp");
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: "#10B981",
                            paddingVertical: 10,
                            borderRadius: 10,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 6,
                            ...getWebCursor(),
                          }}
                        >
                          <Ionicons name="keypad-outline" size={16} color="#fff" />
                          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Điểm danh OTP</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })()}
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
