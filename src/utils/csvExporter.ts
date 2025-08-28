/**
 * Utilitário para exportação de dados em formato CSV
 */

export interface CSVExportOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  dateFormat?: 'ISO' | 'BR';
}

class CSVExporter {
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    let stringValue = String(value);

    // Se contém vírgula, quebra de linha ou aspas, precisa escapar
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      // Escapar aspas duplas duplicando-as
      stringValue = stringValue.replace(/"/g, '""');
      // Envolver em aspas
      stringValue = `"${stringValue}"`;
    }

    return stringValue;
  }

  private formatDate(date: Date, format: 'ISO' | 'BR' = 'BR'): string {
    if (format === 'BR') {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toISOString();
  }

  public exportToCSV<T extends Record<string, any>>(
    data: T[],
    headers: Record<keyof T, string>,
    filename: string = 'export.csv',
    options: CSVExportOptions = {}
  ): void {
    const {
      delimiter = ',',
      includeHeaders = true,
      dateFormat = 'BR'
    } = options;

    if (!data || data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    const csvLines: string[] = [];

    // Adicionar cabeçalhos se necessário
    if (includeHeaders) {
      const headerKeys = Object.keys(headers) as (keyof T)[];
      const headerValues = headerKeys.map(key => this.escapeCSVValue(headers[key]));
      csvLines.push(headerValues.join(delimiter));
    }

    // Adicionar dados
    data.forEach(row => {
      const values = Object.keys(headers).map(key => {
        let value = row[key];

        // Formatar datas se necessário
        if (value instanceof Date) {
          value = this.formatDate(value, dateFormat);
        }

        return this.escapeCSVValue(value);
      });

      csvLines.push(values.join(delimiter));
    });

    // Criar conteúdo CSV
    const csvContent = csvLines.join('\n');

    // Adicionar BOM para suporte a caracteres especiais no Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });

    // Criar link de download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Adicionar ao DOM, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL objeto
    URL.revokeObjectURL(url);
  }

  public convertToCSVString<T extends Record<string, any>>(
    data: T[],
    headers: Record<keyof T, string>,
    options: CSVExportOptions = {}
  ): string {
    const {
      delimiter = ',',
      includeHeaders = true,
      dateFormat = 'BR'
    } = options;

    if (!data || data.length === 0) {
      return '';
    }

    const csvLines: string[] = [];

    // Adicionar cabeçalhos se necessário
    if (includeHeaders) {
      const headerKeys = Object.keys(headers) as (keyof T)[];
      const headerValues = headerKeys.map(key => this.escapeCSVValue(headers[key]));
      csvLines.push(headerValues.join(delimiter));
    }

    // Adicionar dados
    data.forEach(row => {
      const values = Object.keys(headers).map(key => {
        let value = row[key];

        // Formatar datas se necessário
        if (value instanceof Date) {
          value = this.formatDate(value, dateFormat);
        }

        return this.escapeCSVValue(value);
      });

      csvLines.push(values.join(delimiter));
    });

    return csvLines.join('\n');
  }
}

// Exportar instância singleton
export const csvExporter = new CSVExporter();