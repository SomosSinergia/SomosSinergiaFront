"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import AboutUs from "@/components/AboutUs/AboutUs";
import MissionValuesCards from "@/components/MissionValuesCards/MissionValuesCards";
import { MissionValuesPreload } from "@/utils/MissionValuesPreload";
import { signInUser } from "@/helpers/authHelpers";
import { fetchUserData } from "@/helpers/userHelpers";
import { useAppDispatch } from "@/redux/hooks";
import { setUserActive } from "@/redux/features/userSlice";
import OnBoardModal from "@/components/Modals/OnboardModal";

const Home = () => {
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const router = useRouter();
  const [onboardModal, setOnboardModal] = useState<boolean>(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (user?.sub && (!accessToken || accessToken === "")) {
      const checkUser = async () => {
        const userData = await fetchUserData(user.sub!);
        if (!userData) {
          setOnboardModal(true);
        } else {
          await signInUser(userData);
          dispatch(
            setUserActive({
              firstName: userData.firstName,
              profileImgUrl: userData.profileImgUrl,
              lastName: "",
              email: "",
              sub: "",
              role: userData.role,
              id: userData.id,
            })
          );
        }
      };

      checkUser();
    }
  }, [dispatch, user, router]);

  const missionValues = MissionValuesPreload;

  return (
    <div>
      <div className="relative w-full h-[23rem] md:h-[45rem] flex items-center justify-center ">
        <div className="absolute z-[1] h-96 md:h-[45rem] inset-0 bg-gray-900 opacity-20"></div>
        <div className="absolute inset-0 z-0">
          <Image
            src="http://petro.themegum.com/elementor/wp-content/uploads/sites/3/2017/06/slide-2.jpg"
            alt=""
            className="object-cover object-top h-96 md:h-full md:w-full"
            width={1000}
            height={1000}
          />
        </div>
        <div className="relative z-10 text-white text-center mt-[-4rem] md:mt-[-14rem] p-4 rounded-xl px-10">
          <div>
            <h1 className="text-[2rem] md:text-[5rem] font-bold mb-4">
              SOMOS SINERGIA
            </h1>
            <h3 className="md:text-[2rem]">
              Seguridad e Higiene y Medio Ambiente
            </h3>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-[-5rem] md:mt-[-19rem] p-5 w-fit mx-auto relative z-10 bg-white">
        <MissionValuesCards missionValues={missionValues} />
      </div>
      <div>
        <AboutUs />
      </div>
      {onboardModal && <OnBoardModal setOnBoardModal={setOnboardModal} />}
    </div>
  );
};

export default Home;
