import { useState, useEffect, useRef, useCallback } from "react";
import {
  getAdminWords,
  addAdminWord,
  updateAdminWord,
  deleteAdminWord,
  uploadAdminWordCsv,
} from "../api/adminWordApi";

const EMPTY_FORM = { english: "", korean: "", example: "", exampleKorean: "", day: "" };

const AdminWordPage = () => {
  const [words, setWords] = useState([]);
  const [dayFilter, setDayFilter] = useState("");
  const [dayOptions, setDayOptions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // 토스트 표시 후 3초 뒤 자동 소멸
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchWords = useCallback(async (day = "") => {
    try {
      const res = await getAdminWords(day === "" ? null : Number(day));
      const list = res.data.data ?? [];
      setWords(list);
      // 전체 조회 시 day 드롭다운 옵션 갱신
      if (day === "") {
        const unique = [...new Set(list.map((w) => w.day))].sort((a, b) => a - b);
        setDayOptions(unique);
      }
    } catch {
      showToast("단어 목록을 불러오지 못했습니다.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchWords("");
  }, [fetchWords]);

  // day 필터 변경 시 재조회
  const handleDayFilterChange = (e) => {
    const val = e.target.value;
    setDayFilter(val);
    fetchWords(val);
  };

  // ── 모달 열기 ──────────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (word) => {
    setEditTarget(word);
    setForm({
      english: word.english,
      korean: word.korean,
      example: word.example ?? "",
      exampleKorean: word.exampleKorean ?? "",
      day: String(word.day),
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ── 단건 추가/수정 제출 ─────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.english.trim() || !form.korean.trim() || !form.day) {
      setFormError("영어 단어, 한국어 뜻, day는 필수입니다.");
      return;
    }
    const payload = {
      english: form.english.trim(),
      korean: form.korean.trim(),
      example: form.example.trim(),
      exampleKorean: form.exampleKorean.trim(),
      day: Number(form.day),
    };
    try {
      if (editTarget) {
        await updateAdminWord(editTarget.id, payload);
        showToast("단어가 수정되었습니다.");
      } else {
        await addAdminWord(payload);
        showToast("단어가 추가되었습니다.");
      }
      closeModal();
      fetchWords(dayFilter);
    } catch {
      setFormError("저장 중 오류가 발생했습니다.");
    }
  };

  // ── 단건 삭제 ──────────────────────────────────────────
  const handleDelete = async (word) => {
    if (!window.confirm(`"${word.english}" 단어를 삭제하시겠습니까?`)) return;
    try {
      await deleteAdminWord(word.id);
      showToast("단어가 삭제되었습니다.");
      fetchWords(dayFilter);
    } catch {
      showToast("삭제 중 오류가 발생했습니다.", "error");
    }
  };

  // ── CSV 업로드 ──────────────────────────────────────────
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // 파일 선택 초기화 (같은 파일 재선택 허용)
    e.target.value = "";

    setUploading(true);
    try {
      const res = await uploadAdminWordCsv(file);
      showToast(res.data.message ?? "CSV 업로드 성공");
      fetchWords("");
      setDayFilter("");
    } catch (err) {
      const msg = err.response?.data?.message ?? "CSV 업로드 중 오류가 발생했습니다.";
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── 렌더링 ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">단어 관리 (관리자)</h1>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + 단어 추가
          </button>
        </div>

        {/* CSV 업로드 + day 필터 */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  업로드 중...
                </>
              ) : (
                "CSV 일괄 업로드"
              )}
            </button>
            <span className="text-xs text-gray-400">.csv 파일만 허용</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-600">Day 필터:</label>
            <select
              value={dayFilter}
              onChange={handleDayFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">전체</option>
              {dayOptions.map((d) => (
                <option key={d} value={d}>Day {d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 단어 테이블 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left w-16">Day</th>
                <th className="px-4 py-3 text-left w-36">영어</th>
                <th className="px-4 py-3 text-left w-36">한국어</th>
                <th className="px-4 py-3 text-left">예문</th>
                <th className="px-4 py-3 text-center w-28">작업</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    단어가 없습니다.
                  </td>
                </tr>
              ) : (
                words.map((word) => (
                  <tr key={word.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{word.day}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{word.english}</td>
                    <td className="px-4 py-3 text-gray-700">{word.korean}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{word.example}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openEditModal(word)}
                        className="text-blue-500 hover:underline mr-3 text-xs"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(word)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {editTarget ? "단어 수정" : "단어 추가"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {[
                { label: "영어 단어 *", field: "english" },
                { label: "한국어 뜻 *", field: "korean" },
                { label: "예문", field: "example" },
                { label: "예문 번역", field: "exampleKorean" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Day *</label>
                <input
                  type="number"
                  min="1"
                  value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {formError && (
                <p className="text-red-500 text-xs">{formError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editTarget ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm transition-all ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminWordPage;
