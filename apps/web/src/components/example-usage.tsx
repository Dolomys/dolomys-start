import {
	AdminOnly,
	ManagerOrAdminOnly,
	RequirePermissions,
} from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import {
	useAdminPermissions,
	useAuthPermissions,
	useManagerPermissions,
} from "@/hooks/use-auth-permissions";

/**
 * Example component demonstrating the optimized auth implementation
 */
export function ExampleUsage() {
	const { user, isAuthenticated, permissions, conditionalRender } =
		useAuthPermissions();

	const adminPerms = useAdminPermissions();
	const managerPerms = useManagerPermissions();

	if (!isAuthenticated) {
		return <div>Please log in to access this content.</div>;
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h2 className="font-bold text-2xl">Welcome, {user?.name}!</h2>
				<p className="text-muted-foreground">Role: {user?.role}</p>
			</div>

			{/* Basic permission checking */}
			<div className="space-y-2">
				<h3 className="font-semibold text-lg">Basic Permissions</h3>

				{permissions.permissions.canViewUsers && (
					<Button variant="outline">View Users</Button>
				)}

				{permissions.permissions.canManageProjects && (
					<Button variant="outline">Manage Projects</Button>
				)}

				{permissions.permissions.canUploadFiles && (
					<Button variant="outline">Upload Files</Button>
				)}
			</div>

			{/* Component-based permission guards */}
			<div className="space-y-2">
				<h3 className="font-semibold text-lg">Component Guards</h3>

				<AdminOnly
					fallback={
						<p className="text-muted-foreground text-sm">
							Admin only content hidden
						</p>
					}
				>
					<Button variant="destructive">Admin Dashboard</Button>
				</AdminOnly>

				<ManagerOrAdminOnly>
					<Button variant="secondary">Management Reports</Button>
				</ManagerOrAdminOnly>

				<RequirePermissions
					permissions={{ users: ["create"] }}
					fallback={
						<p className="text-muted-foreground text-sm">Cannot create users</p>
					}
				>
					<Button>Create User</Button>
				</RequirePermissions>
			</div>

			{/* Conditional rendering with helper */}
			<div className="space-y-2">
				<h3 className="font-semibold text-lg">Conditional Rendering</h3>

				{conditionalRender(
					<Button variant="outline">Delete Files</Button>,
					{ files: ["delete"] },
					undefined,
					<p className="text-muted-foreground text-sm">Cannot delete files</p>,
				)}
			</div>

			{/* Admin-specific features */}
			{adminPerms.isAdmin && (
				<div className="space-y-2">
					<h3 className="font-semibold text-lg">Admin Features</h3>

					{adminPerms.canBanUsers && (
						<Button variant="destructive">Ban Users</Button>
					)}

					{adminPerms.canImpersonateUsers && (
						<Button variant="outline">Impersonate User</Button>
					)}

					{adminPerms.canManageSettings && (
						<Button variant="outline">System Settings</Button>
					)}
				</div>
			)}

			{/* Manager-specific features */}
			{managerPerms.isManagerOrAdmin && (
				<div className="space-y-2">
					<h3 className="font-semibold text-lg">Manager Features</h3>

					{managerPerms.canManageProjects && (
						<Button variant="outline">Project Management</Button>
					)}

					{managerPerms.canShareProjects && (
						<Button variant="outline">Share Projects</Button>
					)}

					{managerPerms.canViewAnalytics && (
						<Button variant="outline">View Analytics</Button>
					)}
				</div>
			)}

			{/* Permission summary */}
			<div className="space-y-2">
				<h3 className="font-semibold text-lg">Permission Summary</h3>
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div>
						Can manage users:{" "}
						{permissions.permissions.canManageUsers ? "✅" : "❌"}
					</div>
					<div>
						Can view projects:{" "}
						{permissions.permissions.canViewProjects ? "✅" : "❌"}
					</div>
					<div>
						Can upload files:{" "}
						{permissions.permissions.canUploadFiles ? "✅" : "❌"}
					</div>
					<div>
						Can view analytics:{" "}
						{permissions.permissions.canViewAnalytics ? "✅" : "❌"}
					</div>
					<div>Is admin: {permissions.isAdmin ? "✅" : "❌"}</div>
					<div>
						Is manager or admin: {permissions.isManagerOrAdmin ? "✅" : "❌"}
					</div>
				</div>
			</div>
		</div>
	);
}
