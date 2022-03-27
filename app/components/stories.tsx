import { Link } from 'remix'
import { getPhotoSrcSet } from '~/utils/photos'

export default function Stories({ stories }: any) {
	return (
		<>
			{stories.map((story: any, index: number) => (
				<Link to={story.slug} key={index}>
					<div className="relative max-w-3xl h-96 w-full mx-auto rounded-2xl overflow-hidden group mb-14">
						<picture className="absolute top-0 left-0 w-full h-full rounded-2xl transition duration-[4s] ease-in group-hover:scale-150">
							<img
								src={`data:image/jpeg;charset=utf-8;base64,${story?.cover?.bh}`}
								data-srcset={getPhotoSrcSet(story?.cover)}
								data-sizes="auto"
								className="lazy w-full h-full object-cover rounded-2xl"
								alt="Story cover"
							/>
						</picture>
						<div className="absolute bottom-0 w-full transition ease-out duration-1000 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-t after:from-[#000] z-10 group-hover:translate-y-full">
							<h1 className="relative z-20 text-xl font-bold leading-normal p-4 text-neutral-100 transition translate-x-0">
								{story.title}
							</h1>
						</div>
					</div>
				</Link>
			))}
		</>
	)
}
