import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser } from "@/Redux/Auth/Action";
import BrandMark from "@/components/custome/BrandMark";

const LoginWithGoogle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser()).then(() => navigate("/"));
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <BrandMark className="h-12 animate-soft-pulse" />
      <p className="text-sm text-muted-foreground">Accesso con Google in corso</p>
    </div>
  );
};

export default LoginWithGoogle;
