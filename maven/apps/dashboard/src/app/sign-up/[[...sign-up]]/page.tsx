import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <SignUp 
        forceRedirectUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#12121a] border border-white/10",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-white/5 border-white/10 text-white",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
            formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400",
          },
        }}
      />
    </div>
  );
}
