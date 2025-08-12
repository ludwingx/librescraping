"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/app/actions/auth"
import { toast } from "sonner"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(async (prevState: unknown, formData: FormData) => {
    const result = await loginAction(formData)
    if (result?.success) {
      toast.success("¡Inicio de sesión exitoso! Redirigiendo...")
      router.push('/dashboard')
    } else if (result?.error) {
      toast.error(result.error)
    }
    return result
  }, null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={formAction} className="p-6 md:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-4">
  <h1 className="text-2xl font-bold">Libre Scraping</h1>
</div>
<h2 className="text-xl font-semibold mb-2">Inicia sesión</h2>
              </div>
              {/* Mensaje de error si login falló */}
              {state?.error && (
                <div className="mb-2 text-sm text-red-600 text-center font-semibold">
                  {state.error}
                </div>
              )}
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="tu_usuario"
                    required
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    placeholder="**************" 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={pending}
                className="w-full cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
              
            </div>
          </form>
          <div className="bg-muted relative hidden md:flex flex-col items-center justify-center p-8 gap-4">
            <img className="w-35 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
            <img className="w-22 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
