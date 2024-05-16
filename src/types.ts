export interface Item {
  recomandari: never[];
  medic_id: string;
  uid: string;
  key: React.Key;
  id: string;
  nume_medic: string;
  nume: string;
  prenume: string;
  nume_prenume: string;
  varsta: number; 
  CNP: number;
  adresa: string;
  strada: string;
  numar: string;
  bloc: string;
  etaj: number; 
  apartament: number; 
  codPostal: number; 
  judet: string; 
  oras: string; 
  telefon: string;
  email: string;
  profesie: string;
  locDeMunca: string;
  detalii_medicale: string;
  istoric: string; 
  alergii: string; 
  consultatii: string; 
  puls: number;
  temp: number;
  umid: number;

  puls_min_repaus: number;
  puls_max_repaus: number;
  temp_min_repaus: number;
  temp_max_repaus: number;
  umid_min_repaus: number;
  umid_max_repaus: number;

  puls_min_miscare: number;
  puls_max_miscare: number;
  temp_min_miscare: number;
  temp_max_miscare: number;
  umid_min_miscare: number;
  umid_max_miscare: number;


  ecg: string;
  titlu: string;
  descriere: string;
  observatii: string;
  tip_alarma: string;
  comentariu: string;
}