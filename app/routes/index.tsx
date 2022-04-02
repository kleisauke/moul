import { json, useLoaderData } from 'remix'
import Stories from '~/components/stories'

import { Profile } from '~/components/profile'
import profile from '~/data/profile.json'
import storiesJSON from '~/data/stories.json'
import Cover from '~/components/cover'

export async function loader() {
	const stories = storiesJSON.map((s) => {
		const cover = s.photos.find((p) => p.type === 'cover')
		const title = s.blocks.find((b) => b.type === 'title')

		return {
			slug: s.slug,
			cover,
			title: title?.text,
		}
	})

	return json({
		profile,
		stories,
	})
}

export default function Index() {
	const { profile, stories } = useLoaderData()
	return (
		<div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
			<section className="w-full h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] relative mb-16">
				{profile?.cover && <Cover photo={profile.cover} />}
			</section>
			<Profile profile={profile} />
			<Stories stories={stories} />
			{profile.name && (
				<footer className="flex flex-col w-full text-center my-16 text-neutral-400">
					<p>Copyright © {profile.name}. All Rights Reserved.</p>
				</footer>
			)}
		</div>
	)
}