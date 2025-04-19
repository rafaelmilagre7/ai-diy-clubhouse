
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const BasicInfo = ({ form }: any) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium border-b pb-2">Informações Básicas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Ferramenta*</FormLabel>
              <FormControl>
                <Input placeholder="Ex: ChatGPT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="official_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Oficial*</FormLabel>
              <FormControl>
                <Input placeholder="https://www.exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria*</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IA">Inteligência Artificial</SelectItem>
                  <SelectItem value="Automação">Automação</SelectItem>
                  <SelectItem value="No-Code">No-Code</SelectItem>
                  <SelectItem value="Integração">Integração</SelectItem>
                  <SelectItem value="Produtividade">Produtividade</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Logo</FormLabel>
              <FormControl>
                <Input placeholder="https://www.exemplo.com/logo.png" {...field} />
              </FormControl>
              <FormDescription>
                URL da imagem do logo da ferramenta (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-1 md:col-span-2">
              <FormLabel>Descrição*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a ferramenta e suas principais funcionalidades..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <FormLabel>Status</FormLabel>
                <FormDescription>
                  Tornar esta ferramenta visível para os membros
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
