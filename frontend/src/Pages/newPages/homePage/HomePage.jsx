import React, { useEffect, useState } from "react";
import GeneralNavbar from "../../../components/navbar/GeneralNavbar";
import CarrouselHeader from "../../../components/headers/CarrouselHeader";
import GeneralFooter from "../../../components/footer/GeneralFooter";
import CarrouselShowCase from "../../../components/carrousel-show-case/CarrouselShowCase";
import { SwiperSlide } from "swiper/react";
import ItemSlide from "../../../components/carrousel-show-case/ItemSlide";
import GeneralCourseCard from "../../../components/course-cards/GeneralCourseCard";
import Math11CourseCard from "../../../components/course-cards/Math11CourseCard";
import Math12CourseCard from "../../../components/course-cards/Math12CourseCard";
import English12CourseCard from "../../../components/course-cards/Englsh12CourseCard";
import English11CourseCard from "../../../components/course-cards/English11CourseCard";
import Geography10CourseCard from "../../../components/course-cards/Geography10CourseCard";
import Geoscience12CourseCard from "../../../components/course-cards/Geoscience12CourseCard";
import Astronomy9CourseCard from "../../../components/course-cards/Astronomy9CourseCard";
import ComputerScience11CourseCard from "../../../components/course-cards/ComputerScience11CourseCard";
import getCoursesByProp from "../../../BackendProxy/courseProxy/getCoursesByProp";
import { useSelector } from "react-redux";
import getEnrolledCourses from "../../../BackendProxy/courseProxy/getEnrolledCourses";


const HomePage = () => {

  const [loadedCourses, setLoadedCourses] = useState(false)
  const [courses, setCourses] = useState([])
  const authUser = useSelector((state) => state.user);

  useEffect(() => {
    getAllAcceptedCourses()
  },[])


  const getAllAcceptedCourses = async () => {
    try {
      let res;
      if(authUser)
      {
      if(authUser.accountType === "instructor" || authUser.accountType === "admin"  )
      {
        console.log("this is instructor or admin");
      res = await getCoursesByProp('creator.email', authUser.email, authUser.institution.code);
      console.log(res);
      }
      else
      {
       // res = await getCoursesByProp('null', null, authUser.institution.code);
       console.log(authUser._id);
       res = await getEnrolledCourses(authUser._id);
      }

      console.log(res);
      setCourses(res.res);
      setLoadedCourses(true)
    }
    } catch (error) {
      console.error(error);
    }
    
  }

  return (
    <div className="h-full w-full max-w-screen overflow-x-hidden">
    <GeneralNavbar courses={courses} />
    <div className="w-full mx-auto pb-6 flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-4">
        <CarrouselHeader />
      </div>
  
      <div className="w-full max-w-[1200px] px-4 mt-2">
        <p className="font-semibold text-lg md:text-xl text-stone-700">
          Discover Our Course Offerings
        </p>
      </div>
  
      <div className="w-full max-w-[1200px] px-4 mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {courses &&
            courses.map((item) => (
              <div key={item._id} className="transform scale-105 hover:scale-110 transition-transform duration-300">
                <GeneralCourseCard item={item} userId={authUser._id} />
              </div>
            ))}
        </div>
      </div>
    </div>
    <GeneralFooter />
  </div>
  );
};

export default HomePage;
