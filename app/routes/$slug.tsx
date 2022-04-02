import { useEffect } from 'react'
import { json, LoaderFunction, useLoaderData, Link, MetaFunction } from 'remix'
import { fixed_partition } from 'image-layout'

import { Profile } from '~/components/profile'
import { getDimension, getPhotoSrcSet, isBrowser, Photo } from '~/utils'

import stories from '~/data/stories.json'

export let loader: LoaderFunction = async ({ request, params }) => {
	if (new URL(request.url).pathname === '/favicon.ico') return null
	const slug = new URL(request.url).pathname.split('/').pop() || ''
	const story = stories.find((s) => s.slug == slug)
	const cover = story?.photos.find((p) => p.type === 'cover')
	const title = story?.blocks.find((b) => b.type === 'title')?.text

	return json({ status: 'ok', story, cover, title })
}

export let meta: MetaFunction = ({ data }) => {
	let title =
		data.story?.title && data.story.profile?.name
			? `${data.story.title} | ${data.story.profile?.name}`
			: `${data.story.profile?.name}`

	let description = data.story?.description

	return {
		title,
		description,
	}
}

export default function Story() {
	const { status, story, cover, title } = useLoaderData()

	useEffect(() => {
		paintGrid()

		if (isBrowser()) {
			window.addEventListener('resize', () => {
				paintGrid()
			})
		}
	}, [])

	const paintGrid = () => {
		console.time('grid')
		const grid = document.querySelectorAll('.moul-content-photos')
		grid.forEach((el: any) => {
			const photos = el.querySelectorAll('.moul-grid')
			const photosSize: any = []
			photos.forEach((photo: any) => {
				const [w, h] = photo.getAttribute('data-size')?.split(':') as any
				const { width, height } = getDimension(+w, +h, 2048, 2048)

				photosSize.push({ width, height })
			})
			const idealElementHeight = document.body.clientWidth < 800 ? 280 : 380
			const containerWidth =
				document.body.clientWidth > 2000 && photosSize.length < 4
					? 1800
					: document.body.clientWidth
			const layout = fixed_partition(photosSize, {
				containerWidth,
				idealElementHeight,
				spacing: 16,
			})
			el.classList.add('is-grid')
			el.style.width = `${layout.width}px`
			el.style.height = `${layout.height}px`

			layout.positions.forEach((_: any, i: number) => {
				photos[i].style.position = `absolute`
				photos[i].style.top = `${layout.positions[i].y}px`
				photos[i].style.left = `${layout.positions[i].x}px`
				photos[i].style.width = `${layout.positions[i].width}px`
				photos[i].style.height = `${layout.positions[i].height}px`
			})
		})
		console.timeEnd('grid')
	}

	return (
		<>
			{status === 'not_found' && <div>Not found!</div>}

			{status === 'ok' && (
				<>
					<div className="">
						<div className="moul-cover w-full h-[380px] md:h-[500px] lg:h-[600px] xl:h-[750px] relative mb-16">
							{cover && (
								<>
									{cover?.bh ? (
										<Link
											to={`photo/${cover?.hash}`}
											key={cover?.hash}
											className=""
										>
											<picture className="absolute top-0 left-0 w-full h-full">
												<img
													src={`data:image/jpeg;charset=utf-8;base64,${cover?.bh}`}
													data-srcset={getPhotoSrcSet(cover)}
													data-sizes="auto"
													className="lazy w-full h-full object-cover"
													alt="Story cover"
												/>
											</picture>
										</Link>
									) : (
										<Link
											to={`photo/${cover?.hash}`}
											key={cover?.hash}
											className=""
										>
											<picture className="absolute top-0 left-0 w-full h-full">
												<img
													src={cover.url}
													data-sizes="auto"
													className="lazy w-full h-full object-cover"
													alt="Story cover"
												/>
											</picture>
										</Link>
									)}
								</>
							)}
						</div>
						<Profile profile={story.profile} />
						{title && (
							<div className="moul-content-title mx-auto font-bold max-w-3xl mb-6 text-neutral-50 px-6 xs:px-0">
								<h1 className="text-5xl">{title}</h1>
							</div>
						)}
					</div>
					<div className="mx-auto">
						{story.blocks.map((b: any, i: number) => (
							<div className={`leading-relaxed moul-content-${b.type}`} key={i}>
								{b.type === 'quote' && (
									<blockquote className="px-6 xs:px-0 text-xl text-g max-w-3xl mx-auto my-12 text-neutral-400 border-neutral-400 border-l-4 pl-4">
										{b.text}
									</blockquote>
								)}
								{b.type === 'paragraph' && (
									<p className="px-6 xs:px-0 text-xl max-w-3xl mx-auto my-12 text-neutral-200">
										{b.text}
									</p>
								)}
								{b.type === 'heading' && (
									<h2 className="px-6 xs:px-0 text-4xl max-w-3xl mx-auto my-12 text-neutral-100">
										{b.text}
									</h2>
								)}
								{b.type === 'subheading' && (
									<h3 className="px-6 xs:px-0 text-3xl max-w-3xl mx-auto my-12 text-neutral-100">
										{b.text}
									</h3>
								)}
								{b.type === 'photos' && (
									<div className="relative">
										{story.photos
											.filter((p: any) => p.type === b.text)
											.map((p: Photo, i: number) => (
												<Link to={`photo/${p.hash}`} key={p.hash}>
													<picture
														className={`moul-grid`}
														data-size={`${p.width}:${p.height}`}
													>
														{p?.bh ? (
															<img
																className="lazy"
																src={`data:image/jpeg;charset=utf-8;base64,${p?.bh}`}
																data-sizes="auto"
																data-srcset={getPhotoSrcSet(p)}
															/>
														) : (
															<img
																className="lazy"
																src={p.url}
																data-sizes="auto"
															/>
														)}
													</picture>
												</Link>
											))}
									</div>
								)}
							</div>
						))}
					</div>

					<footer className="flex flex-col w-full text-center my-16 text-neutral-400">
						{story?.profile.name && (
							<p>Copyright © {story.profile.name}. All Rights Reserved.</p>
						)}
					</footer>
				</>
			)}
		</>
	)
}