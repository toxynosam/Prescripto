import React, { useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfweek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // Optimized: Use useMemo to prevent unnecessary recalculations
  const fetchDocInfo = useCallback(() => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  }, [doctors, docId]);

  // Fixed the infinite loop bug and optimized performance
  const getAvailableSlots = useCallback(() => {
    const allSlots = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      // Create date for current iteration
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Set end time for this day (9 PM)
      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      // Set start time
      if (i === 0) {
        // For today, start from next available slot
        const currentHour = currentDate.getHours();
        const currentMin = currentDate.getMinutes();

        if (currentHour >= 21) {
          continue; // Skip today if it's past 9 PM
        }

        // Start from next 30-min slot after current time or 10 AM, whichever is later
        if (currentHour < 10) {
          currentDate.setHours(10, 0, 0, 0);
        } else {
          // Round up to next 30-min interval
          const mins = currentMin < 30 ? 30 : 0;
          const hrs = currentMin < 30 ? currentHour : currentHour + 1;
          currentDate.setHours(hrs, mins, 0, 0);
        }
      } else {
        // For future days, start at 10 AM
        currentDate.setHours(10, 0, 0, 0);
      }

      const timeSlots = [];

      // Generate 30-minute slots
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        timeSlots.push({
          dateTime: new Date(currentDate),
          time: formattedTime,
        });

        // ✅ FIXED: Increment by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        allSlots.push(timeSlots);
      }
    }

    setDocSlots(allSlots);
  }, []);

  // Fetch doctor info only when dependencies change
  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo();
    }
  }, [fetchDocInfo, doctors]);

  // Generate slots only once when docInfo is available
  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo, getAvailableSlots]);

  // Optional: Debug logging (remove in production)
  useEffect(() => {
    if (docSlots.length > 0) {
      console.log("Available slots:", docSlots);
    }
  }, [docSlots]);
  return (
    docInfo && (
      <div>
        {/*........................Doctor's Details.................................*/}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg "
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/*............Doc Info : name, degree, experience ............. */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-600">
              {docInfo.name}{" "}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full ">
                {docInfo.experience}
              </button>
            </div>

            {/*..............Doctor About ..............*/}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3 ">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4 ">
              Appointment Fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>
        {/* ............Booking Slots....................... */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => {
                const slot = item[0];

                return slot?.dateTime ? (
                  <div
                    onClick={() => setSlotIndex(index)}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                      slotIndex === index
                        ? "bg-primary text-white"
                        : "border border-gray-200"
                    }`}
                    key={index}
                  >
                    <p>{daysOfweek[slot.dateTime.getDay()]}</p>
                    <p>{slot.dateTime.getDate()}</p>
                  </div>
                ) : null;
              })}
          </div>
          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4 ">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-primary text-white "
                      : "text-gray-400 border border-gray-400"
                  } `}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">
            Book an Appointment
          </button>
        </div>
      </div>
    )
  );
};

export default Appointment;
