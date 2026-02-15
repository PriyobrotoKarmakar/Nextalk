import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Info } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (e) => {
    const image = e.target.files[0];
    if (!image) return;

    const reader = new FileReader();
    reader.readAsDataURL(image);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-20 px-4 pb-12 transition-colors duration-500">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Manage your NexTalk account
          </p>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img
              src={selectedImage || authUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4 border-white dark:border-[#1C1C1E] shadow-xl"
            />
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0 
                bg-blue-600 hover:bg-blue-500 
                p-2.5 rounded-full cursor-pointer 
                transition-all duration-200 shadow-lg
                ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-70" : "active:scale-90"}
              `}
            >
              <Camera className="size-5 text-white" strokeWidth={2} />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
            {isUpdatingProfile ? "Updating your photo..." : "Tap the camera to change photo"}
          </p>
        </div>

        {/* User Information Group */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 ml-4 tracking-wide uppercase">
            Personal Details
          </label>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
            {/* Full Name Row */}
            <div className="flex items-center gap-4 p-4 border-b border-black/5 dark:border-white/5">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <User className="size-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Full Name</p>
                <p className="text-[15px] font-medium text-gray-900 dark:text-white">{authUser?.fullName}</p>
              </div>
            </div>

            {/* Email Row */}
            <div className="flex items-center gap-4 p-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                <Mail className="size-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Email Address</p>
                <p className="text-[15px] font-medium text-gray-900 dark:text-white">{authUser?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Group */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 ml-4 tracking-wide uppercase">
            Account Status
          </label>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500/10">
                  <Info className="size-5 text-gray-500" strokeWidth={1.5} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-[15px]">Member Since</span>
              </div>
              <span className="text-[14px] font-semibold text-gray-500 dark:text-gray-400">
                {authUser.createdAt?.split("T")[0]}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-[15px]">Status</span>
              </div>
              <span className="text-[14px] font-bold text-green-500 uppercase tracking-tight">Active</span>
            </div>
          </div>
        </div>

        {/* Logout/Action Footer can go here */}
      </div>
    </div>
  );
};

export default ProfilePage;