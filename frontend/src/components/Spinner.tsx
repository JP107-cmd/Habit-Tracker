export default function Spinner() {
    return (
        <div className="flex items-center mt-44 space-x-2 animate-spin duration-800 max-w-96">
            <div className="bg-transparent border-4 border-b-transparent rounded-full w-24
            border-indigo-500 h-24"></div>
        </div>
    )
}