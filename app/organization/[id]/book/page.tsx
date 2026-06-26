"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  useGetPublicSalon,
  PublicService,
  PublicStaff,
} from "@/app/api/hooks/public/useGetPublicSalon";
import {
  useGetPublicAvailability,
  TimeSlot,
} from "@/app/api/hooks/public/useGetPublicAvailability";
import { useCreatePublicBooking } from "@/app/api/hooks/public/useCreatePublicBooking";
import {
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Calendar,
  Scissors,
  ArrowLeft,
  Loader2,
  Star,
  Users,
} from "lucide-react";

// ─────────────────────────── Types ───────────────────────────────────────────

type Step = "service" | "staff" | "datetime" | "details" | "confirmed";

type Selection = {
  service: PublicService | null;
  staff: PublicStaff | null; // null = "any"
  slot: TimeSlot | null;
  date: Date | null;
};

// ─────────────────────────── Helpers ─────────────────────────────────────────

function formatPrice(min?: number | null, max?: number | null): string {
  if (min == null) return "Besplatno";
  if (max != null && max !== min) return `€${min} – €${max}`;
  return `€${min}`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

const HR_DAYS = ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"];
const HR_MONTHS = [
  "siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj",
  "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac",
];
const HR_MONTHS_CAP = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac",
];

function formatMonthYear(d: Date): string {
  return `${HR_MONTHS_CAP[d.getMonth()]} ${d.getFullYear()}`;
}

function dayLabel(d: Date): string {
  if (isToday(d)) return "Danas";
  const day = HR_DAYS[(d.getDay() + 6) % 7]; // Mon=0
  return `${day}, ${d.getDate()}. ${HR_MONTHS[d.getMonth()]}`;
}

// ─────────────────────────── Step indicator ──────────────────────────────────

const STEPS: { id: Step; label: string }[] = [
  { id: "service", label: "Usluga" },
  { id: "staff", label: "Djelatnik" },
  { id: "datetime", label: "Datum i vrijeme" },
  { id: "details", label: "Detalji" },
];

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all
                  ${done ? "bg-emerald-500 text-white" : ""}
                  ${
                    active
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : ""
                  }
                  ${!done && !active ? "bg-gray-100 text-gray-400" : ""}
                `}
              >
                {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`mt-1 text-[10px] font-medium whitespace-nowrap
                  ${
                    active
                      ? "text-emerald-700"
                      : done
                      ? "text-emerald-500"
                      : "text-gray-400"
                  }
                `}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-4 mx-1 transition-colors
                  ${i < idx ? "bg-emerald-400" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── Service step ────────────────────────────────────

function ServiceStep({
  services,
  onSelect,
}: {
  services: PublicService[];
  onSelect: (s: PublicService) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900">Odaberite uslugu</h2>
      <p className="text-sm text-gray-500 mb-6">
        Što možemo učiniti za vas danas?
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => onSelect(svc)}
            className="group text-left p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-emerald-400 hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: svc.color ? `${svc.color}22` : "#d1fae5",
                }}
              >
                <Scissors
                  className="h-5 w-5"
                  style={{ color: svc.color ?? "#059669" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-emerald-700 truncate">
                  {svc.name}
                </p>
                {svc.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {svc.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(svc.durationMin)}
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {formatPrice(svc.priceMin, svc.priceMax)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── Staff step ──────────────────────────────────────

function StaffStep({
  staff,
  onSelect,
  onBack,
}: {
  staff: PublicStaff[];
  onSelect: (s: PublicStaff | null) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
      >
        <ArrowLeft className="h-4 w-4" /> Natrag
      </button>
      <h2 className="text-xl font-bold text-gray-900">Odaberite djelatnika</h2>
      <p className="text-sm text-gray-500 mb-6">Ili prepustite nama da odaberemo.</p>

      {/* Any staff option */}
      <button
        onClick={() => onSelect(null)}
        className="w-full text-left p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-500 transition-all duration-200 mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">
              Bilo koji dostupni djelatnik
            </p>
            <p className="text-xs text-emerald-600">
              Dodijelit ćemo najboljeg dostupnog člana tima
            </p>
          </div>
        </div>
      </button>

      <div className="grid gap-3 sm:grid-cols-2">
        {staff.map((member) => {
          const initials = member.name
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("");

          return (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              className="group text-left p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-emerald-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white font-bold text-base">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-emerald-700">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── Mini calendar ───────────────────────────────────

function MiniCalendar({
  selected,
  onSelect,
  maxAdvanceDays,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  maxAdvanceDays: number;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxAdvanceDays);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
  });

  const prevMonth = () => setViewMonth((m) => startOfMonth(addDays(m, -1)));
  const nextMonth = () =>
    setViewMonth((m) => startOfMonth(addDays(endOfMonth(m), 1)));

  return (
    <div className="w-full select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <span className="font-semibold text-gray-800">
          {formatMonthYear(viewMonth)}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {HR_DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const isPast = isBefore(day, today);
          const isTooFar = isBefore(maxDate, day);
          const isDisabled = isPast || isTooFar || !inMonth;
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isTodayDay = isToday(day);

          return (
            <button
              key={day.toISOString()}
              disabled={isDisabled}
              onClick={() => onSelect(day)}
              className={`
                mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all
                ${
                  isDisabled
                    ? "text-gray-200 cursor-not-allowed"
                    : "cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                }
                ${
                  isSelected
                    ? "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white shadow-sm"
                    : ""
                }
                ${
                  isTodayDay && !isSelected
                    ? "ring-2 ring-emerald-400 text-emerald-700"
                    : ""
                }
                ${!inMonth ? "opacity-0 pointer-events-none" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── DateTime step ───────────────────────────────────

function DateTimeStep({
  orgId,
  service,
  staffId,
  maxAdvanceDays,
  onSelect,
  onBack,
}: {
  orgId: string;
  service: PublicService;
  staffId: string | null;
  maxAdvanceDays: number;
  onSelect: (date: Date, slot: TimeSlot) => void;
  onBack: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  const { data: availability, isLoading } = useGetPublicAvailability(
    orgId,
    service.id,
    staffId,
    dateStr
  );

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      onSelect(selectedDate, selectedSlot);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Natrag
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Odaberite datum i vrijeme
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {service.name} · {formatDuration(service.durationMin)}
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Calendar */}
        <div className="sm:w-64 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <MiniCalendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            maxAdvanceDays={maxAdvanceDays}
          />
        </div>

        {/* Time slots */}
        <div className="flex-1">
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
              <Calendar className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Odaberite datum</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : !availability?.slots.length ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
              <Clock className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Nema dostupnih termina</p>
              <p className="text-xs mt-1">Pokušajte drugi datum</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {dayLabel(selectedDate)} — {availability.slots.length} dostupnih termina
              </p>
              <div className="grid grid-cols-3 gap-2">
                {availability.slots.map((slot) => (
                  <button
                    key={slot.startUtc}
                    onClick={() => handleSlotSelect(slot)}
                    className={`
                      py-2.5 px-2 rounded-xl text-sm font-semibold border-2 transition-all
                      ${
                        selectedSlot?.startUtc === slot.startUtc
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md scale-105"
                          : "bg-white border-gray-100 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm"
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDate && selectedSlot && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4">
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {dayLabel(selectedDate)} u {selectedSlot.time}
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Trajanje: {formatDuration(service.durationMin)}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Nastavi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Details step ────────────────────────────────────

function DetailsStep({
  selection,
  orgId,
  onConfirmed,
  onBack,
}: {
  selection: Selection;
  orgId: string;
  onConfirmed: (bookingId: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const { mutateAsync: createBooking, isPending } =
    useCreatePublicBooking(orgId);

  const validate = () => {
    const e: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) e.name = "Unesite puno ime i prezime";
    if (phone.trim().length < 6) e.phone = "Unesite ispravan broj telefona";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selection.slot) return;

    try {
      const result = await createBooking({
        clientName: name.trim(),
        serviceId: selection.service!.id,
        staffId: selection.staff?.id ?? null,
        startAt: selection.slot.startUtc,
        endAt: selection.slot.endUtc,
        notes: notes.trim() || null,
      });
      onConfirmed(result.id);
    } catch {
      setErrors({ name: "Rezervacija nije uspjela. Pokušajte ponovo." });
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Natrag
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Vaši podaci</h2>
      <p className="text-sm text-gray-500 mb-6">
        Još samo nekoliko detalja!
      </p>

      {/* Booking summary */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 border border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <Scissors className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-gray-800">
            {selection.service?.name}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">
            {formatDuration(selection.service?.durationMin ?? 0)}
          </span>
          <span className="ml-auto font-semibold text-emerald-700">
            {formatPrice(
              selection.service?.priceMin,
              selection.service?.priceMax
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <span>
            {selection.date ? dayLabel(selection.date) : ""} u{" "}
            {selection.slot?.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4 text-emerald-600" />
          <span>{selection.staff?.name ?? "Bilo koji dostupni djelatnik"}</span>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Puno ime i prezime <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ana Kovač"
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-colors
              ${
                errors.name
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-emerald-400 bg-white"
              }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Broj telefona <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+385 91 234 5678"
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-colors
              ${
                errors.phone
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-emerald-400 bg-white"
              }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Napomena{" "}
            <span className="text-gray-400 text-xs font-normal">
              (neobavezno)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Posebni zahtjevi ili napomene..."
            rows={3}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-400 bg-white resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-2xl hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-md text-base mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Rezerviranje...
            </>
          ) : (
            "Potvrdi rezervaciju"
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── Confirmed screen ────────────────────────────────

function ConfirmedStep({
  selection,
  salonName,
  onStartOver,
}: {
  selection: Selection;
  salonName: string;
  onStartOver: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-11 w-11 text-emerald-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Rezervacija potvrđena!</h2>
      <p className="text-gray-500 mb-8">
        Vaš termin u{" "}
        <span className="font-semibold text-gray-700">{salonName}</span>{" "}
        je potvrđen.
      </p>

      <div className="bg-gray-50 rounded-2xl p-5 text-left border border-gray-100 max-w-sm mx-auto space-y-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <Scissors className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Usluga</p>
            <p className="font-semibold text-gray-800 text-sm">
              {selection.service?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Datum i vrijeme</p>
            <p className="font-semibold text-gray-800 text-sm">
              {selection.date ? dayLabel(selection.date) : ""} u{" "}
              {selection.slot?.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Djelatnik</p>
            <p className="font-semibold text-gray-800 text-sm">
              {selection.staff?.name ?? "Bilo koji dostupni djelatnik"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStartOver}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
      >
        Rezerviraj još jedan termin
      </button>
    </div>
  );
}

// ─────────────────────────── Sidebar summary ─────────────────────────────────

function SidebarSummary({
  salon,
  selection,
}: {
  salon: { name: string; address?: string | null; phone?: string | null };
  selection: Selection;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Salon branding */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-sm">
            {salon.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{salon.name}</h1>
            <p className="text-xs text-emerald-600 font-medium">Online rezervacija</p>
          </div>
        </div>
        {salon.address && (
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
            <span>{salon.address}</span>
          </div>
        )}
        {salon.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1.5">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{salon.phone}</span>
          </div>
        )}
      </div>

      {/* Current selection */}
      {(selection.service || selection.slot) && (
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Vaš odabir
          </p>
          <div className="space-y-3">
            {selection.service && (
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: selection.service.color ?? "#059669",
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {selection.service.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDuration(selection.service.durationMin)} ·{" "}
                    {formatPrice(
                      selection.service.priceMin,
                      selection.service.priceMax
                    )}
                  </p>
                </div>
              </div>
            )}
            {selection.staff !== undefined && selection.service && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {selection.staff?.name ?? "Bilo koji dostupni djelatnik"}
                </p>
              </div>
            )}
            {selection.date && selection.slot && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {dayLabel(selection.date)} u {selection.slot.time}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Main page ───────────────────────────────────────

export default function BookPage() {
  const params = useParams();
  const orgId = params.id as string;

  const { data: salon, isLoading, isError } = useGetPublicSalon(orgId);

  const [step, setStep] = useState<Step>("service");
  const [selection, setSelection] = useState<Selection>({
    service: null,
    staff: null,
    slot: null,
    date: null,
  });
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleServiceSelect = (s: PublicService) => {
    setSelection({ service: s, staff: null, slot: null, date: null });
    setStep("staff");
  };

  const handleStaffSelect = (s: PublicStaff | null) => {
    setSelection((prev) => ({ ...prev, staff: s }));
    setStep("datetime");
  };

  const handleDateTimeSelect = (date: Date, slot: TimeSlot) => {
    setSelection((prev) => ({ ...prev, date, slot }));
    setStep("details");
  };

  const handleConfirmed = (id: string) => {
    setConfirmedId(id);
    setStep("confirmed");
  };

  const handleStartOver = () => {
    setSelection({ service: null, staff: null, slot: null, date: null });
    setConfirmedId(null);
    setStep("service");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (isError || !salon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Salon nije pronađen
          </h2>
          <p className="text-sm text-gray-500">
            Ova booking poveznica je možda netočna ili salon više nije aktivan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar (mobile only) */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base">
          {salon.name[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{salon.name}</p>
          {salon.address && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {salon.address}
            </p>
          )}
        </div>
      </div>

      <div className="lg:flex lg:h-screen lg:overflow-hidden">
        {/* Left sidebar (desktop only) — sticky, full height, independent scroll */}
        <aside className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto">
          <div className="p-8 xl:p-10 flex-1">
            <SidebarSummary salon={salon} selection={selection} />
          </div>
        </aside>

        {/* Main content — scrollable area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
            {step !== "confirmed" && <StepBar current={step} />}

            {step === "service" && (
              <ServiceStep
                services={salon.services}
                onSelect={handleServiceSelect}
              />
            )}

            {step === "staff" && (
              <StaffStep
                staff={salon.staff}
                onSelect={handleStaffSelect}
                onBack={() => setStep("service")}
              />
            )}

            {step === "datetime" && selection.service && (
              <DateTimeStep
                orgId={orgId}
                service={selection.service}
                staffId={selection.staff?.id ?? null}
                maxAdvanceDays={salon.maxAdvanceDays}
                onSelect={handleDateTimeSelect}
                onBack={() => setStep("staff")}
              />
            )}

            {step === "details" && selection.service && (
              <DetailsStep
                selection={selection}
                orgId={orgId}
                onConfirmed={handleConfirmed}
                onBack={() => setStep("datetime")}
              />
            )}

            {step === "confirmed" && (
              <ConfirmedStep
                selection={selection}
                salonName={salon.name}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
