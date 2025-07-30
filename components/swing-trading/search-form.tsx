'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SearchCriteria } from '@/lib/types/trading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const sectors = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Materials',
  'Industrials',
  'Utilities',
  'Real Estate',
  'Communication Services',
];

const formSchema = z.object({
  priceMin: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Must be a positive number',
  }),
  priceMax: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Must be a positive number',
  }),
  marketCapMin: z.string().optional(),
  marketCapMax: z.string().optional(),
  volumeRequirement: z.string().optional(),
  sectors: z.array(z.string()).optional(),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  holdingPeriod: z.enum(['short', 'medium', 'long']),
});

type FormData = z.infer<typeof formSchema>;

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceMin: '10',
      priceMax: '500',
      marketCapMin: '',
      marketCapMax: '',
      volumeRequirement: '',
      sectors: [],
      riskTolerance: 'medium',
      holdingPeriod: 'medium',
    },
  });

  const onSubmit = (data: FormData) => {
    const criteria: SearchCriteria = {
      priceRange: {
        min: Number(data.priceMin),
        max: Number(data.priceMax),
      },
      marketCapRange: data.marketCapMin && data.marketCapMax ? {
        min: Number(data.marketCapMin) * 1000000,
        max: Number(data.marketCapMax) * 1000000,
      } : undefined,
      volumeRequirement: data.volumeRequirement ? Number(data.volumeRequirement) : undefined,
      sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
      riskTolerance: data.riskTolerance,
      holdingPeriod: data.holdingPeriod,
    };

    onSearch(criteria);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Criteria</CardTitle>
        <CardDescription>
          Define your parameters for finding swing trading opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priceMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketCapMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Market Cap (millions)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty for no minimum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketCapMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Market Cap (millions)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty for no maximum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volumeRequirement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Daily Volume</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormDescription>Minimum average daily volume</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskTolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Tolerance</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk tolerance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low (2-3% stop loss)</SelectItem>
                        <SelectItem value="medium">Medium (3-5% stop loss)</SelectItem>
                        <SelectItem value="high">High (5-7% stop loss)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holdingPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holding Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select holding period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short (2-5 days)</SelectItem>
                        <SelectItem value="medium">Medium (1-3 weeks)</SelectItem>
                        <SelectItem value="long">Long (1-2 months)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>Sectors (Optional)</FormLabel>
              <FormDescription>Select preferred sectors to focus on</FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sectors.map((sector) => (
                  <div key={sector} className="flex items-center space-x-2">
                    <Checkbox
                      id={sector}
                      checked={selectedSectors.includes(sector)}
                      onCheckedChange={(checked) => {
                        setSelectedSectors((prev) =>
                          checked
                            ? [...prev, sector]
                            : prev.filter((s) => s !== sector)
                        );
                      }}
                    />
                    <label
                      htmlFor={sector}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Stocks...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search for Opportunities
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}