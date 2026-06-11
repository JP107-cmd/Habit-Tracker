import Spinner from "./Spinner";

export default function Loading() {
    return (
    <div className="flex items-center mt-16 min-h-screen px-4 flex-col gap-5 w-full">
        <Spinner/>
    </div>);
}