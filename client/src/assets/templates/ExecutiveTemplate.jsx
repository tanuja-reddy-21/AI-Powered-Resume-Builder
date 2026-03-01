import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ExecutiveTemplate = ({ data, accentColor }) => {
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const [year, month] = dateStr.split("-");
		return new Date(year, month - 1).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short"
		});
	};

	const getTextColor = (bgColor) => {
		const hex = bgColor.replace('#', '');
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 128 ? '#000000' : '#FFFFFF';
	};

	return (
		<div className="max-w-4xl mx-auto bg-white text-gray-800">
			{/* Header */}
			<header className="p-8" style={{ backgroundColor: accentColor, color: getTextColor(accentColor) }}>
				<h1 className="text-4xl font-bold mb-1">
					{data.personal_info?.full_name || "Your Name"}
				</h1>
				<p className="text-lg font-light mb-4 opacity-90">
					{data.targetRole || "Professional"}
				</p>

				<div className="grid grid-cols-2 gap-2 text-sm opacity-90">
					{data.personal_info?.email && (
						<div className="flex items-center gap-2">
							<Mail className="size-4" />
							<span>{data.personal_info.email}</span>
						</div>
					)}
					{data.personal_info?.phone && (
						<div className="flex items-center gap-2">
							<Phone className="size-4" />
							<span>{data.personal_info.phone}</span>
						</div>
					)}
					{data.personal_info?.location && (
						<div className="flex items-center gap-2">
							<MapPin className="size-4" />
							<span>{data.personal_info.location}</span>
						</div>
					)}
					{data.personal_info?.linkedin && (
						<div className="flex items-center gap-2">
							<Linkedin className="size-4" />
							<span className="text-xs truncate">{data.personal_info.linkedin.replace('https://www.', '')}</span>
						</div>
					)}
				</div>
			</header>

			<div className="p-8">
				{/* Two-column top section */}
				<div className="grid grid-cols-3 gap-8 mb-8">
					{/* Summary - 2 columns */}
					{data.professional_summary && (
						<div className="col-span-2">
							<h2 className="text-xl font-bold mb-3 pb-2 border-b-2" style={{ borderColor: accentColor }}>
								EXECUTIVE SUMMARY
							</h2>
							<p className="text-gray-700 leading-relaxed">{data.professional_summary}</p>
						</div>
					)}

					{/* Skills - 1 column */}
					{data.skills && data.skills.length > 0 && (
						<div>
							<h2 className="text-xl font-bold mb-3 pb-2 border-b-2" style={{ borderColor: accentColor }}>
								CORE SKILLS
							</h2>
							<ul className="space-y-1 text-sm">
								{data.skills.slice(0, 8).map((skill, index) => (
									<li key={index} className="text-gray-700">• {skill}</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Experience */}
				{data.experience && data.experience.length > 0 && (
					<section className="mb-8">
						<h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
							PROFESSIONAL EXPERIENCE
						</h2>

						<div className="space-y-6">
							{data.experience.map((exp, index) => (
								<div key={index}>
									<div className="flex justify-between items-start mb-2">
										<div>
											<h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
											<p className="font-medium text-gray-700">{exp.company}</p>
										</div>
										<div className="text-sm text-gray-600">
											{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
										</div>
									</div>
									{exp.description && (
										<div className="text-gray-700 leading-relaxed whitespace-pre-line">
											{exp.description}
										</div>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* Projects */}
				{data.project && data.project.length > 0 && (
					<section className="mb-8">
						<h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
							KEY PROJECTS
						</h2>

						<div className="space-y-4">
							{data.project.map((p, index) => (
								<div key={index}>
									<h3 className="font-semibold text-gray-900">{p.name}</h3>
									{p.description && (
										<p className="text-gray-700 text-sm leading-relaxed mt-1">
											{p.description}
										</p>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* Education */}
				{data.education && data.education.length > 0 && (
					<section>
						<h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
							EDUCATION
						</h2>

						<div className="space-y-3">
							{data.education.map((edu, index) => (
								<div key={index} className="flex justify-between items-start">
									<div>
										<h3 className="font-semibold text-gray-900">
											{edu.degree} {edu.field && `in ${edu.field}`}
										</h3>
										<p className="text-gray-700">{edu.institution}</p>
										{edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
									</div>
									<div className="text-sm text-gray-600">
										{formatDate(edu.graduation_date)}
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}

export default ExecutiveTemplate;
